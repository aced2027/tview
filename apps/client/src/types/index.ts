export type Timeframe = '1s' | '5s' | '10s' | '30s' | '1m' | '1min' | '3m' | '5m' | '5min' | '15m' | '15min' | '30m' | '30min' | '1h' | '2h' | '4h' | '6h' | '12h' | '1D' | '1d' | '1W' | '1w' | '1M';

export type ChartType = 'candlestick' | 'heikin-ashi' | 'line' | 'area' | 'bar' | 'hollow';

export type DrawingTool = 'cursor' | 'horizontal' | 'horizontal-line' | 'vertical' | 'trendline' | 'ray' | 'rectangle' | 'fibonacci' | 'cross' | 'dot' | 'arrow' | 'eraser';
export type CursorTool = 'cursor' | 'horizontal' | 'horizontal-line' | 'vertical' | 'trendline' | 'cross' | 'dot' | 'arrow' | 'eraser';
export type TrendTool = 'trendline' | 'ray' | 'horizontal-line' | 'vertical';

export interface Tick {
  timestamp: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  pipSize: number;
  tickCount: number;
  from: number;
  to: number;
  avgSpread: number;
}

export interface Position {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl?: number;
  tp?: number;
  openTime: number;
  pnl: number;
  pips: number;
}

export interface Order {
  symbol: string;
  direction: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop-limit';
  volume: number;
  price?: number;
  sl?: number;
  tp?: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  volume: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: number;
  exitTime: number;
  pnl: number;
  pips: number;
}
