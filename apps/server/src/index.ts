import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { TickLoader } from './services/tickLoader.js';
import { TickStreamer } from './services/tickStreamer.js';
import { setupWebSocket } from './websocket/tickSocket.js';
import { createSymbolsRouter } from './routes/symbols.js';
import { createCandlesRouter } from './routes/candles.js';
import { createTicksRouter } from './routes/ticks.js';
import { createAuthRouter } from './routes/auth.js';
import { createUserRouter } from './routes/user.js';
import { isSupabaseEnabled } from './config/supabase.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3001;
const TICK_DATA_PATH = process.env.TICK_DATA_PATH || './data/ticks';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const loader = new TickLoader(TICK_DATA_PATH);
const streamer = new TickStreamer(loader);

app.use('/api/symbols', createSymbolsRouter(loader));
app.use('/api/candles', createCandlesRouter(loader));
app.use('/api/ticks', createTicksRouter(loader));

// Supabase-powered routes (only if configured)
if (isSupabaseEnabled()) {
  app.use('/api/auth', createAuthRouter());
  app.use('/api/users', createUserRouter());
  console.log('✅ Supabase integration enabled');
} else {
  console.log('⚠️  Supabase not configured - user features disabled');
}

setupWebSocket(server, streamer);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const symbols = loader.detectSymbols();
  console.log(`Detected symbols: ${symbols.join(', ') || 'none'}`);
});
