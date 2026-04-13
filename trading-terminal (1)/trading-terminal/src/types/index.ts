export interface Tick {
  time: number;   // unix ms
  price: number;
}

export interface Candle {
  time: number;   // bucket start (unix ms)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // number of ticks in this candle
}

export interface Timeframe {
  label: string;
  ms: number;
}

export const TIMEFRAMES: Timeframe[] = [
  { label: '1s',  ms: 1_000 },
  { label: '5s',  ms: 5_000 },
  { label: '30s', ms: 30_000 },
  { label: '1m',  ms: 60_000 },
  { label: '5m',  ms: 300_000 },
  { label: '15m', ms: 900_000 },
  { label: '30m', ms: 1_800_000 },
  { label: '1h',  ms: 3_600_000 },
  { label: '4h',  ms: 14_400_000 },
  { label: '1D',  ms: 86_400_000 },
  { label: '1W',  ms: 604_800_000 },
  { label: '1M',  ms: 2_592_000_000 },
];
