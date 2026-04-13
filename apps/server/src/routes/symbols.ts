import { Router } from 'express';
import { TickLoader } from '../services/tickLoader.js';

export function createSymbolsRouter(loader: TickLoader) {
  const router = Router();

  router.get('/', (req, res) => {
    const symbols = loader.detectSymbols();
    res.json({ symbols });
  });

  router.get('/:symbol/info', async (req, res) => {
    try {
      const { symbol } = req.params;
      const ticks = await loader.loadTicks(symbol);

      if (ticks.length === 0) {
        return res.status(404).json({ error: 'Symbol not found' });
      }

      const spreads = ticks.map(t => t.ask - t.bid);
      const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;

      res.json({
        symbol,
        pipSize: 0.0001,
        tickCount: ticks.length,
        from: ticks[0].timestamp,
        to: ticks[ticks.length - 1].timestamp,
        avgSpread
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load symbol info' });
    }
  });

  return router;
}
