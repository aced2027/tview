import type { Tick } from '../types';

/**
 * Generates realistic simulated EUR/USD tick data.
 * Replace this with your real WebSocket feed.
 *
 * @param startPrice  Starting price (default 1.09)
 * @param durationMs  How far back in time to generate (default ~200 * 4h)
 * @param tickIntervalMs  Approx ms between ticks (default 500ms)
 */
export function generateTicks(
  startPrice = 1.09,
  durationMs = 200 * 14_400_000,
  tickIntervalMs = 500
): Tick[] {
  const now = Date.now();
  const start = now - durationMs;
  const ticks: Tick[] = [];

  let price = startPrice;
  let t = start;

  while (t <= now) {
    // Random walk with slight mean-reversion and trend noise
    const trend = Math.sin(t / 3_600_000) * 0.000003;
    const noise = (Math.random() - 0.502) * 0.00008;
    price += noise + trend;
    price = Math.max(1.070, Math.min(1.110, price));

    ticks.push({ time: t, price: +price.toFixed(5) });

    // Variable tick spacing (200–800ms)
    t += Math.floor(Math.random() * 600 + 200);
  }

  return ticks;
}

/**
 * Aggregates an array of ticks into OHLC candles for the given timeframe (ms).
 */
export function aggregateCandles(ticks: Tick[], tfMs: number) {
  const map = new Map<number, { open: number; high: number; low: number; close: number; volume: number }>();

  for (const tick of ticks) {
    const bucket = Math.floor(tick.time / tfMs) * tfMs;
    const existing = map.get(bucket);
    if (!existing) {
      map.set(bucket, { open: tick.price, high: tick.price, low: tick.price, close: tick.price, volume: 1 });
    } else {
      existing.high = Math.max(existing.high, tick.price);
      existing.low  = Math.min(existing.low,  tick.price);
      existing.close = tick.price;
      existing.volume++;
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, c]) => ({ time, ...c }));
}

/**
 * Formats a candle timestamp into a human-readable label based on the timeframe.
 */
export function formatCandleTime(date: Date, tfMs: number): string {
  if (tfMs < 60_000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (tfMs < 86_400_000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
