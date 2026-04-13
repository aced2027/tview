/**
 * Local Candle Data Service
 * Loads pre-generated candles from public/candles directory
 * Optimized for fast loading with caching
 */

import { Candle, Timeframe } from '../types';

export interface CandleData {
  candles: Candle[];
  pair: string;
  timeframe: Timeframe;
}

// Cache for loaded candles - optimized with Map
const candleCache = new Map<string, { candles: Candle[], timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

// Available pairs
export const AVAILABLE_PAIRS = [
  'AUDUSD',
  'EURUSD',
  'GBPUSD',
  'NZDUSD',
  'USDCAD',
  'USDCHF',
  'USDJPY'
];

// Available timeframes
export const AVAILABLE_TIMEFRAMES: Timeframe[] = [
  '1min',
  '5min',
  '15min',
  '30min',
  '1h',
  '4h',
  '1d',
  '1w'
];

/**
 * Load candles from local JSON file with optimized caching
 */
export async function loadCandles(
  pair: string,
  timeframe: Timeframe
): Promise<Candle[]> {
  const cacheKey = `${pair.toLowerCase()}_${timeframe}`;
  
  // Check cache first (with TTL)
  const cached = candleCache.get(cacheKey);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < CACHE_TTL) {
      console.log(`[candles] Using cached data for ${pair} ${timeframe} (${cached.candles.length} candles)`);
      return cached.candles;
    } else {
      candleCache.delete(cacheKey);
    }
  }

  try {
    const url = `/candles/${pair.toLowerCase()}/${timeframe}.json`;
    console.log(`[candles] Fetching ${pair} ${timeframe} from ${url}`);
    
    const startTime = performance.now();
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }

    const candles: Candle[] = await response.json();
    const loadTime = performance.now() - startTime;
    
    // Validate candle format
    if (!Array.isArray(candles)) {
      throw new Error(`Expected array of candles, got ${typeof candles}`);
    }

    if (candles.length > 0) {
      const sample = candles[0];
      if (!('time' in sample) || !('open' in sample) || !('high' in sample) || !('low' in sample) || !('close' in sample)) {
        throw new Error('Invalid candle format: missing OHLC data');
      }
    }

    // Cache the candles with timestamp
    candleCache.set(cacheKey, { candles, timestamp: Date.now() });
    console.log(`[candles] ✓ Loaded ${candles.length} candles for ${pair} ${timeframe} in ${loadTime.toFixed(2)}ms`);
    
    return candles;
  } catch (error) {
    console.error(`[candles] Error loading candles:`, error);
    throw error;
  }
}

/**
 * Get list of available pairs
 */
export function getPairs(): string[] {
  return AVAILABLE_PAIRS;
}

/**
 * Get list of available timeframes
 */
export function getTimeframes(): Timeframe[] {
  return AVAILABLE_TIMEFRAMES;
}

/**
 * Clear cache (useful for development)
 */
export function clearCache(): void {
  candleCache.clear();
  console.log('[candles] Cache cleared');
}

/**
 * Check if candles are cached
 */
export function isCached(pair: string, timeframe: Timeframe): boolean {
  const cacheKey = `${pair.toLowerCase()}_${timeframe}`;
  return candleCache.has(cacheKey);
}

/**
 * Preload common pairs and timeframes in parallel
 */
export async function preloadCommonData(): Promise<void> {
  const commonTimeframes: Timeframe[] = ['1h', '4h', '1d'];
  const pairsToPreload = AVAILABLE_PAIRS.slice(0, 2); // First 2 pairs for speed

  console.log('[candles] Starting preload of common data...');
  
  // Create all promises in parallel
  const preloadPromises: Promise<Candle[]>[] = [];
  
  for (const pair of pairsToPreload) {
    for (const tf of commonTimeframes) {
      preloadPromises.push(
        loadCandles(pair, tf).catch(err => {
          console.warn(`[candles] Preload failed for ${pair} ${tf}:`, err);
          return [];
        })
      );
    }
  }

  try {
    const startTime = performance.now();
    const results = await Promise.all(preloadPromises);
    const totalTime = performance.now() - startTime;
    const totalCandles = results.reduce((sum, arr) => sum + arr.length, 0);
    console.log(`[candles] ✓ Preload complete: ${totalCandles} candles in ${totalTime.toFixed(2)}ms`);
  } catch (error) {
    console.warn('[candles] Preloading had errors:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  let totalCandles = 0;
  let totalSize = 0;
  
  candleCache.forEach((value) => {
    totalCandles += value.candles.length;
    // Rough estimate: ~100 bytes per candle
    totalSize += value.candles.length * 100;
  });
  
  return {
    itemsInCache: candleCache.size,
    totalCandles,
    estimatedSizeMB: (totalSize / 1024 / 1024).toFixed(2)
  };
}
