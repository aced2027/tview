import { Router } from 'express';
import { dbService } from '../services/databaseService.js';

export function createAuthRouter() {
  const router = Router();

  // Sign up
  router.post('/signup', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const result = await dbService.createUser(email, password);
      res.json({ success: true, user: result.user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Sign in
  router.post('/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const result = await dbService.signIn(email, password);
      res.json({ success: true, user: result.user, session: result.session });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Sign out
  router.post('/signout', async (req, res) => {
    try {
      await dbService.signOut();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}