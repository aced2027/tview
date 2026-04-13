import { WebSocketServer, WebSocket } from 'ws';
import { TickStreamer } from '../services/tickStreamer.js';
import { Tick } from '../types/index.js';

export function setupWebSocket(server: any, streamer: TickStreamer) {
  const wss = new WebSocketServer({ server, path: '/stream' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'subscribe' && message.symbol) {
          await streamer.startStream(message.symbol, (tick: Tick) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'tick',
                symbol: message.symbol,
                data: tick
              }));
            }
          });
        } else if (message.type === 'unsubscribe' && message.symbol) {
          streamer.stopStream(message.symbol);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return wss;
}
