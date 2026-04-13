import { Router } from 'express';
import { TickLoader } from '../services/tickLoader.js';
import { CandleCache, aggregateTicksToCandles } from '../services/candleCache.js';
import { Timeframe } from '../types/index.js';

export function createCandlesRouter(loader: TickLoader) {
  const router = Router();
  const cache = new CandleCache();

  router.get('/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { tf, from, to } = req.query;
      
      const timeframe = (tf as Timeframe) || '1h';
      
      console.log(`[candles] Request: ${symbol} ${timeframe}`);
      
      // Check cache first
      const cached = cache.get(symbol, timeframe);
      if (cached) {
        console.log(`[candles] Cache HIT: ${symbol} ${timeframe} (${cached.length} candles)`);
        return res.json({ symbol, timeframe, candles: cached });
      }
      
      console.log(`[candles] Cache MISS: ${symbol} ${timeframe} - loading ticks...`);
      
      // Load ticks
      const fromTs = from ? parseInt(from as string) * 1000 : undefined;
      const toTs = to ? parseInt(to as string) * 1000 : undefined;
      
      const ticks = await loader.loadTicks(symbol, fromTs, toTs, 10000000);
      
      if (ticks.length === 0) {
        return res.json({ symbol, timeframe, candles: [] });
      }
      
      console.log(`[candles] Loaded ${ticks.length} ticks, aggregating to ${timeframe}...`);
      
      // Aggregate to candles
      const candles = aggregateTicksToCandles(ticks, timeframe);
      
      console.log(`[candles] Generated ${candles.length} candles`);
      
      // Cache the result
      cache.set(symbol, timeframe, candles);
      
      res.json({
        symbol,
        timeframe,
        candles
      });
    } catch (error) {
      console.error('[candles] Error:', error);
      res.status(500).json({ error: 'Failed to generate candles' });
    }
  });

  // Cache management endpoint
  router.delete('/cache/:symbol?', (req, res) => {
    const { symbol } = req.params;
    cache.clear(symbol);
    res.json({ message: symbol ? `Cache cleared for ${symbol}` : 'All cache cleared' });
  });

  router.get('/cache/stats', (req, res) => {
    res.json(cache.getStats());
  });

  return router;
}
