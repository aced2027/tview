import { Router } from 'express';
import { dbService } from '../services/databaseService.js';

export function createUserRouter() {
  const router = Router();

  // Get user watchlist
  router.get('/:userId/watchlist', async (req, res) => {
    try {
      const { userId } = req.params;
      const watchlist = await dbService.getWatchlist(userId);
      res.json(watchlist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add to watchlist
  router.post('/:userId/watchlist', async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol } = req.body;
      
      if (!symbol) {
        return res.status(400).json({ error: 'Symbol required' });
      }
      
      const result = await dbService.addToWatchlist(userId, symbol);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove from watchlist
  router.delete('/:userId/watchlist/:symbol', async (req, res) => {
    try {
      const { userId, symbol } = req.params;
      await dbService.removeFromWatchlist(userId, symbol);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user trades
  router.get('/:userId/trades', async (req, res) => {
    try {
      const { userId } = req.params;
      const trades = await dbService.getUserTrades(userId);
      res.json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create trade
  router.post('/:userId/trades', async (req, res) => {
    try {
      const { userId } = req.params;
      const tradeData = { ...req.body, user_id: userId };
      
      const trade = await dbService.createTrade(tradeData);
      res.json(trade);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Close trade
  router.put('/:userId/trades/:tradeId/close', async (req, res) => {
    try {
      const { tradeId } = req.params;
      const { exitPrice } = req.body;
      
      if (!exitPrice) {
        return res.status(400).json({ error: 'Exit price required' });
      }
      
      const trade = await dbService.closeTrade(tradeId, exitPrice);
      res.json(trade);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user stats
  router.get('/:userId/stats', async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await dbService.getUserStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get price alerts
  router.get('/:userId/alerts', async (req, res) => {
    try {
      const { userId } = req.params;
      const alerts = await dbService.getUserAlerts(userId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create price alert
  router.post('/:userId/alerts', async (req, res) => {
    try {
      const { userId } = req.params;
      const alertData = { ...req.body, user_id: userId };
      
      const alert = await dbService.createPriceAlert(alertData);
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deactivate alert
  router.put('/alerts/:alertId/deactivate', async (req, res) => {
    try {
      const { alertId } = req.params;
      await dbService.deactivateAlert(alertId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}