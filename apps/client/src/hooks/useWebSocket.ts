import { useEffect } from 'react';
import { wsService } from '../services/websocket';
import { Tick } from '../types';

export function useWebSocket(symbol: string, onTick: (tick: Tick) => void) {
  useEffect(() => {
    wsService.connect();
    wsService.subscribe(symbol, onTick);

    return () => {
      wsService.unsubscribe(symbol);
    };
  }, [symbol, onTick]);
}
