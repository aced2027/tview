# Trading Terminal

Real-time EUR/USD candlestick chart — tick data aggregated per timeframe.

## Quick start in Kiro

```bash
# 1. Open this folder in Kiro
# 2. Open the terminal (Ctrl+`)

npm install
npm run dev
# → http://localhost:5173
```

## Timeframes
Click any button: **1s · 5s · 30s · 1m · 5m · 15m · 30m · 1h · 4h · 1D · 1W · 1M**

Switching timeframe re-aggregates the same tick array into different-sized candles instantly.

## Chart controls
| Action | Control |
|--------|---------|
| Pan left/right | Click & drag |
| Zoom in/out | Mouse wheel |
| Inspect candle | Hover (shows O/H/L/C) |

## Connect real tick data
Edit `src/hooks/useLiveFeed.ts` — replace the `setInterval` with your WebSocket:

```ts
const ws = new WebSocket('wss://your-feed/EURUSD');
ws.onmessage = (e) => {
  const { price } = JSON.parse(e.data);
  pushTick({ time: Date.now(), price });
};
```

## Project structure
```
src/
├── types/          Tick, Candle, Timeframe
├── utils/          Tick generation + OHLC aggregation
├── store/          Zustand state (ticks → candles)
├── hooks/          Live feed hook
├── components/
│   ├── TopBar.tsx
│   ├── TimeframeSelector.tsx
│   └── CandlestickChart.tsx
├── App.tsx
└── main.tsx
.kiro/steering.md   — Kiro project context
```
