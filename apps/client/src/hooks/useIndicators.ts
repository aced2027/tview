import { useMemo } from 'react';
import { Candle } from '../types';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../utils/indicators';

export function useIndicators(candles: Candle[]) {
  const closes = useMemo(() => candles.map(c => c.close), [candles]);

  const sma20 = useMemo(() => calculateSMA(closes, 20), [closes]);
  const sma50 = useMemo(() => calculateSMA(closes, 50), [closes]);
  const ema21 = useMemo(() => calculateEMA(closes, 21), [closes]);
  const rsi = useMemo(() => calculateRSI(closes, 14), [closes]);
  const macd = useMemo(() => calculateMACD(closes), [closes]);
  const bb = useMemo(() => calculateBollingerBands(closes), [closes]);

  return {
    sma20,
    sma50,
    ema21,
    rsi,
    macd,
    bollingerBands: bb
  };
}
