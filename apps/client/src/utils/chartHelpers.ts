import { Candle } from '../types';

export function calculatePriceChange(candles: Candle[]): number {
  if (candles.length < 2) return 0;
  const first = candles[0].open;
  const last = candles[candles.length - 1].close;
  return ((last - first) / first) * 100;
}

export function calculateVolume(candles: Candle[]): number {
  return candles.reduce((sum, c) => sum + c.volume, 0);
}

export function findHighLow(candles: Candle[]): { high: number; low: number } {
  if (candles.length === 0) return { high: 0, low: 0 };
  
  let high = candles[0].high;
  let low = candles[0].low;
  
  for (const candle of candles) {
    if (candle.high > high) high = candle.high;
    if (candle.low < low) low = candle.low;
  }
  
  return { high, low };
}

export function calculateSpread(bid: number, ask: number, pipSize: number = 0.0001): number {
  return (ask - bid) / pipSize;
}

export function calculatePips(entryPrice: number, exitPrice: number, pipSize: number = 0.0001): number {
  return (exitPrice - entryPrice) / pipSize;
}

export function formatTimeRange(from: number, to: number): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
}
