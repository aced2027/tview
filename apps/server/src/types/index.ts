export type Timeframe = '1s' | '5s' | '10s' | '30s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1D' | '1W' | '1M';

export interface Tick {
  timestamp: number;  // Unix ms
  bid: number;
  ask: number;
  last: number;
  volume: number;
}

export interface Candle {
  time: number;  // Unix seconds
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
