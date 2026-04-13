import { describe, it, expect } from 'vitest';
import { calculateSMA, calculateEMA, calculateRSI } from './indicators';

describe('indicators', () => {
  describe('calculateSMA', () => {
    it('should calculate simple moving average', () => {
      const data = [1, 2, 3, 4, 5];
      const sma = calculateSMA(data, 3);
      
      expect(sma[0]).toBeNaN();
      expect(sma[1]).toBeNaN();
      expect(sma[2]).toBe(2);
      expect(sma[3]).toBe(3);
      expect(sma[4]).toBe(4);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate exponential moving average', () => {
      const data = [1, 2, 3, 4, 5];
      const ema = calculateEMA(data, 3);
      
      expect(ema[0]).toBeNaN();
      expect(ema[1]).toBeNaN();
      expect(ema[2]).toBe(2);
      expect(ema[3]).toBeCloseTo(3, 1);
      expect(ema[4]).toBeCloseTo(4, 1);
    });
  });

  describe('calculateRSI', () => {
    it('should calculate RSI', () => {
      const data = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28];
      const rsi = calculateRSI(data, 14);
      
      expect(rsi[rsi.length - 1]).toBeGreaterThan(50);
      expect(rsi[rsi.length - 1]).toBeLessThan(100);
    });
  });
});
