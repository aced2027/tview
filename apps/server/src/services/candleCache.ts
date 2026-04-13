import { Tick, Candle, Timeframe } from '../types/index.js';

interface CacheEntry {
  candles: Candle[];
  timestamp: number;
}

export class CandleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 3600000; // 1 hour cache

  getCacheKey(symbol: string, timeframe: Timeframe): string {
    return `${symbol}:${timeframe}`;
  }

  get(symbol: string, timeframe: Timeframe): Candle[] | null {
    const key = this.getCacheKey(symbol, timeframe);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.candles;
  }

  set(symbol: string, timeframe: Timeframe, candles: Candle[]): void {
    const key = this.getCacheKey(symbol, timeframe);
    this.cache.set(key, {
      candles,
      timestamp: Date.now()
    });
  }

  clear(symbol?: string): void {
    if (symbol) {
      // Clear all timeframes for this symbol
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${symbol}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const TIMEFRAME_MS: Record<Timeframe, number> = {
  '1s': 1000,
  '5s': 5000,
  '10s': 10000,
  '30s': 30000,
  '1m': 60000,
  '3m': 180000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '2h': 7200000,
  '4h': 14400000,
  '6h': 21600000,
  '12h': 43200000,
  '1D': 86400000,
  '1W': 604800000,
  '1M': 2592000000
};

export function aggregateTicksToCandles(ticks: Tick[], timeframe: Timeframe): Candle[] {
  if (ticks.length === 0) return [];

  const intervalMs = TIMEFRAME_MS[timeframe];
  const candles: Candle[] = [];
  
  let currentCandle: Partial<Candle> | null = null;
  let currentBucketStart = 0;

  for (const tick of ticks) {
    const price = tick.last || (tick.bid + tick.ask) / 2;
    const bucketStart = Math.floor(tick.timestamp / intervalMs) * intervalMs;

    if (bucketStart !== currentBucketStart) {
      if (currentCandle) {
        candles.push(currentCandle as Candle);
      }
      
      currentBucketStart = bucketStart;
      currentCandle = {
        time: Math.floor(bucketStart / 1000),
        open: price,
        high: price,
        low: price,
        close: price,
        volume: tick.volume || 0
      };
    } else if (currentCandle) {
      currentCandle.high = Math.max(currentCandle.high!, price);
      currentCandle.low = Math.min(currentCandle.low!, price);
      currentCandle.close = price;
      currentCandle.volume = (currentCandle.volume || 0) + (tick.volume || 0);
    }
  }

  if (currentCandle) {
    candles.push(currentCandle as Candle);
  }

  return candles;
}
