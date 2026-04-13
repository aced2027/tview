import { Tick } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, (tick: Tick) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;

  connect() {
    this.ws = new WebSocket(`${WS_URL}/stream`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'tick' && message.symbol) {
        const listener = this.listeners.get(message.symbol);
        if (listener) listener(message.data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  subscribe(symbol: string, callback: (tick: Tick) => void) {
    this.listeners.set(symbol, callback);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  unsubscribe(symbol: string) {
    this.listeners.delete(symbol);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const wsService = new WebSocketService();
