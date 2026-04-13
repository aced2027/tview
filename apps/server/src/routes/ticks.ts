import { Router } from 'express';
import { TickLoader } from '../services/tickLoader.js';

export function createTicksRouter(loader: TickLoader) {
  const router = Router();

  router.get('/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { from, to, limit } = req.query;

      const fromTs = from ? parseInt(from as string) * 1000 : undefined;
      const toTs = to ? parseInt(to as string) * 1000 : undefined;
      // Default to 10 million ticks (enough for full months of data)
      const limitNum = limit ? parseInt(limit as string) : 10000000;

      const ticks = await loader.loadTicks(symbol, fromTs, toTs, limitNum);

      res.json({
        symbol,
        ticks
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load ticks' });
    }
  });

  return router;
}
