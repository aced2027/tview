# Trading Terminal — Kiro Steering File

## Project purpose
A real-time candlestick charting terminal for EUR/USD (or any FX pair).
Tick data is aggregated into OHLC candles for any selected timeframe.

## Tech stack
- React 18 + TypeScript
- Vite (dev server + bundler)
- Zustand (state management)
- Canvas 2D API for chart rendering (no chart library — raw canvas)

## Key architecture decisions
- **Single source of truth**: all ticks live in `chartStore.ts`. Candles are
  derived by calling `aggregateCandles(ticks, tfMs)` whenever the timeframe changes.
- **No chart library**: the `CandlestickChart` component renders directly to
  `<canvas>` via `CanvasRenderingContext2D`. Do not add Chart.js or similar.
- **Live feed**: `useLiveFeed.ts` contains the tick producer. To connect a real
  WebSocket replace the `setInterval` body with your WS `onmessage` handler
  and call `pushTick({ time, price })`.

## Coding conventions
- Functional components only, no class components.
- All styles as `React.CSSProperties` objects — no CSS files, no CSS modules.
- Zustand store slices: state fields + actions in the same `create()` call.
- All prices displayed with `.toFixed(5)` (5 decimal places for FX).
- Canvas drawing code in a `draw` function stabilised with `useCallback`.
- `devicePixelRatio` scaling applied to every canvas measurement.

## File map
src/
  types/index.ts          — Tick, Candle, Timeframe types + TIMEFRAMES array
  utils/tickUtils.ts      — generateTicks(), aggregateCandles(), formatCandleTime()
  store/chartStore.ts     — Zustand store (ticks, candles, tfIndex, candleWidth, offsetX)
  hooks/useLiveFeed.ts    — live tick producer (swap for real WS here)
  components/
    TopBar.tsx            — symbol, bid/ask, spread, daily % change
    TimeframeSelector.tsx — 1s 5s 30s 1m 5m 15m 30m 1h 4h 1D 1W 1M buttons
    CandlestickChart.tsx  — canvas renderer + mouse/wheel interaction
  App.tsx                 — root layout, mounts useLiveFeed
  main.tsx                — ReactDOM entry

## Extending the project
- Add indicators (EMA, Bollinger Bands): compute in `utils/`, draw on the same canvas after candles.
- Add a second symbol: add a `symbol` field to the store and pass it to `generateTicks()` / WS.
- Add a volume histogram: draw a second mini-canvas below the main one, reading `candle.volume`.
- Connect real data: implement a WebSocket service in `src/services/wsClient.ts`,
  call `pushTick()` from there, and remove `useLiveFeed.ts`.
