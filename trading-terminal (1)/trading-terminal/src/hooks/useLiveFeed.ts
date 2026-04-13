import { useEffect } from 'react';
import { useChartStore } from '../store/chartStore';

/**
 * Simulates a live tick feed.
 * Replace the setInterval body with your real WebSocket onmessage handler,
 * then call pushTick({ time: Date.now(), price }) for each incoming tick.
 */
export function useLiveFeed() {
  const pushTick = useChartStore((s) => s.pushTick);
  const ticks    = useChartStore((s) => s.ticks);

  useEffect(() => {
    const id = setInterval(() => {
      const lastPrice = ticks[ticks.length - 1]?.price ?? 1.09;
      const noise = (Math.random() - 0.502) * 0.00007;
      const price = +Math.max(1.070, Math.min(1.110, lastPrice + noise)).toFixed(5);
      pushTick({ time: Date.now(), price });
    }, 800);

    return () => clearInterval(id);
  }, [pushTick, ticks]);
}
