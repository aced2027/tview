import { describe, it, expect } from 'vitest';
import { aggregateTicks } from './tickAggregator';
import { Tick } from '../types/index';

describe('tickAggregator', () => {
  it('should aggregate ticks into 1m candles', () => {
    const ticks: Tick[] = [
      { timestamp: 1000000, bid: 1.08, ask: 1.082, last: 1.081, volume: 100 },
      { timestamp: 1030000, bid: 1.085, ask: 1.087, last: 1.086, volume: 150 },
      { timestamp: 1060000, bid: 1.083, ask: 1.085, last: 1.084, volume: 120 },
    ];

    const candles = aggregateTicks(ticks, '1m');
    
    expect(candles).toHaveLength(1);
    expect(candles[0].open).toBe(1.081);
    expect(candles[0].close).toBe(1.084);
    expect(candles[0].high).toBe(1.086);
    expect(candles[0].low).toBe(1.081);
    expect(candles[0].volume).toBe(370);
  });

  it('should handle empty tick array', () => {
    const candles = aggregateTicks([], '5m');
    expect(candles).toHaveLength(0);
  });

  it('should use mid price when last is zero', () => {
    const ticks: Tick[] = [
      { timestamp: 1000000, bid: 1.08, ask: 1.082, last: 0, volume: 100 },
    ];

    const candles = aggregateTicks(ticks, '1m');
    expect(candles[0].open).toBe(1.081);
  });
});
