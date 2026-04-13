import { Candle } from '../types';

export function convertToHeikinAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];

  const haCandles: Candle[] = [];
  let prevHA: Candle | null = null;

  for (const candle of candles) {
    const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
    const haOpen = prevHA ? (prevHA.open + prevHA.close) / 2 : (candle.open + candle.close) / 2;
    const haHigh = Math.max(candle.high, haOpen, haClose);
    const haLow = Math.min(candle.low, haOpen, haClose);

    const haCandle: Candle = {
      time: candle.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: candle.volume
    };

    haCandles.push(haCandle);
    prevHA = haCandle;
  }

  return haCandles;
}
