-- Trading Terminal Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS public.trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    type VARCHAR(4) CHECK (type IN ('buy', 'sell')) NOT NULL,
    entry_price DECIMAL(10, 5) NOT NULL,
    exit_price DECIMAL(10, 5),
    quantity DECIMAL(15, 2) NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    pnl DECIMAL(15, 2),
    status VARCHAR(10) CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    target_price DECIMAL(10, 5) NOT NULL,
    condition VARCHAR(5) CHECK (condition IN ('above', 'below')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.historical_candles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    open DECIMAL(10, 5) NOT NULL,
    high DECIMAL(10, 5) NOT NULL,
    low DECIMAL(10, 5) NOT NULL,
    close DECIMAL(10, 5) NOT NULL,
    volume DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, timeframe, timestamp)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_historical_candles_symbol_timeframe ON public.historical_candles(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_historical_candles_timestamp ON public.historical_candles(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_candles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Watchlists: Users can only see their own watchlists
CREATE POLICY "Users can view their own watchlists" ON public.watchlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = user_id);

-- Trades: Users can only see their own trades
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);

-- Price Alerts: Users can only see their own alerts
CREATE POLICY "Users can view their own alerts" ON public.price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Historical Candles: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view historical candles" ON public.historical_candles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to calculate trade statistics
CREATE OR REPLACE FUNCTION get_user_trade_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_trades', COUNT(*),
        'winning_trades', COUNT(*) FILTER (WHERE pnl > 0),
        'losing_trades', COUNT(*) FILTER (WHERE pnl < 0),
        'total_pnl', COALESCE(SUM(pnl), 0),
        'average_pnl', COALESCE(AVG(pnl), 0),
        'win_rate', CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END,
        'best_trade', COALESCE(MAX(pnl), 0),
        'worst_trade', COALESCE(MIN(pnl), 0)
    ) INTO result
    FROM public.trades 
    WHERE user_id = user_uuid AND status = 'closed';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a view for trade performance
CREATE OR REPLACE VIEW public.trade_performance AS
SELECT 
    user_id,
    symbol,
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE pnl > 0) as winning_trades,
    COUNT(*) FILTER (WHERE pnl < 0) as losing_trades,
    COALESCE(SUM(pnl), 0) as total_pnl,
    COALESCE(AVG(pnl), 0) as average_pnl,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(*) FILTER (WHERE pnl > 0)::DECIMAL / COUNT(*)) * 100, 2)
        ELSE 0 
    END as win_rate
FROM public.trades 
WHERE status = 'closed'
GROUP BY user_id, symbol;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.watchlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_alerts;