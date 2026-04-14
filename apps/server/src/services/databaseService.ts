import { supabase, isSupabaseEnabled } from '../config/supabase.js';
import { Tick, Candle } from '../types/index.js';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry_price: number;
  exit_price?: number;
  quantity: number;
  entry_time: string;
  exit_time?: string;
  pnl?: number;
  status: 'open' | 'closed';
}

export interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  condition: 'above' | 'below';
  is_active: boolean;
  created_at: string;
}

export class DatabaseService {
  
  // ── User Management ────────────────────────────────────────────────────
  
  async createUser(email: string, password: string) {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
  
  async signIn(email: string, password: string) {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
  
  async signOut() {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  }
  
  // ── Watchlist Management ───────────────────────────────────────────────
  
  async addToWatchlist(userId: string, symbol: string): Promise<Watchlist> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!
      .from('watchlists')
      .insert({ user_id: userId, symbol })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getWatchlist(userId: string): Promise<Watchlist[]> {
    if (!isSupabaseEnabled()) return [];
    
    const { data, error } = await supabase!
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  async removeFromWatchlist(userId: string, symbol: string): Promise<void> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { error } = await supabase!
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);
    
    if (error) throw error;
  }
  
  // ── Trade Management ───────────────────────────────────────────────────
  
  async createTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!
      .from('trades')
      .insert(trade)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<Trade> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getUserTrades(userId: string): Promise<Trade[]> {
    if (!isSupabaseEnabled()) return [];
    
    const { data, error } = await supabase!
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('entry_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  async closeTrade(tradeId: string, exitPrice: number): Promise<Trade> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    // First get the trade to calculate PnL
    const { data: trade, error: fetchError } = await supabase!
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Calculate PnL
    const pnl = trade.type === 'buy' 
      ? (exitPrice - trade.entry_price) * trade.quantity
      : (trade.entry_price - exitPrice) * trade.quantity;
    
    // Update trade
    const { data, error } = await supabase!
      .from('trades')
      .update({
        exit_price: exitPrice,
        exit_time: new Date().toISOString(),
        pnl,
        status: 'closed'
      })
      .eq('id', tradeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // ── Price Alerts ───────────────────────────────────────────────────────
  
  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'created_at'>): Promise<PriceAlert> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase!
      .from('price_alerts')
      .insert(alert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    if (!isSupabaseEnabled()) return [];
    
    const { data, error } = await supabase!
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  async deactivateAlert(alertId: string): Promise<void> {
    if (!isSupabaseEnabled()) throw new Error('Supabase not configured');
    
    const { error } = await supabase!
      .from('price_alerts')
      .update({ is_active: false })
      .eq('id', alertId);
    
    if (error) throw error;
  }
  
  // ── Analytics ──────────────────────────────────────────────────────────
  
  async getUserStats(userId: string) {
    if (!isSupabaseEnabled()) return null;
    
    const { data, error } = await supabase!
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'closed');
    
    if (error) throw error;
    
    const trades = data || [];
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      totalPnL,
      winRate,
      averagePnL: totalTrades > 0 ? totalPnL / totalTrades : 0
    };
  }
  
  // ── Historical Data Storage (Optional) ──────────────────────────────────
  
  async storeCandles(symbol: string, timeframe: string, candles: Candle[]): Promise<void> {
    if (!isSupabaseEnabled()) return;
    
    const records = candles.map(candle => ({
      symbol,
      timeframe,
      timestamp: new Date(candle.time * 1000).toISOString(),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));
    
    const { error } = await supabase!
      .from('historical_candles')
      .upsert(records, { onConflict: 'symbol,timeframe,timestamp' });
    
    if (error) throw error;
  }
  
  async getStoredCandles(symbol: string, timeframe: string, from?: Date, to?: Date): Promise<Candle[]> {
    if (!isSupabaseEnabled()) return [];
    
    let query = supabase!
      .from('historical_candles')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: true });
    
    if (from) query = query.gte('timestamp', from.toISOString());
    if (to) query = query.lte('timestamp', to.toISOString());
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      time: Math.floor(new Date(record.timestamp).getTime() / 1000),
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close,
      volume: record.volume
    }));
  }
}

export const dbService = new DatabaseService();