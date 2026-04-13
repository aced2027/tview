import { create } from 'zustand';
import type { Tick, Candle } from '../types';
import { TIMEFRAMES } from '../types';
import { generateTicks, aggregateCandles } from '../utils/tickUtils';

interface ChartState {
  ticks: Tick[];
  candles: Candle[];
  tfIndex: number;          // index into TIMEFRAMES
  candleWidth: number;      // px per candle (before DPR scaling)
  offsetX: number;          // scroll offset in logical px

  // Actions
  setTimeframe: (index: number) => void;
  pushTick: (tick: Tick) => void;
  setCandleWidth: (w: number) => void;
  setOffsetX: (x: number) => void;
  rebuildCandles: () => void;
}

function initialTicks(): Tick[] {
  return generateTicks();
}

export const useChartStore = create<ChartState>((set, get) => {
  const ticks = initialTicks();
  const tfIndex = 7; // default 1h
  const candles = aggregateCandles(ticks, TIMEFRAMES[tfIndex].ms);

  return {
    ticks,
    candles,
    tfIndex,
    candleWidth: 10,
    offsetX: 0,

    setTimeframe: (index) => {
      const { ticks } = get();
      const candles = aggregateCandles(ticks, TIMEFRAMES[index].ms);
      set({ tfIndex: index, candles, offsetX: 0 });
    },

    pushTick: (tick) => {
      const { ticks, tfIndex } = get();
      const next = [...ticks, tick];
      const candles = aggregateCandles(next, TIMEFRAMES[tfIndex].ms);
      set({ ticks: next, candles });
    },

    setCandleWidth: (w) => set({ candleWidth: Math.max(3, Math.min(40, w)) }),

    setOffsetX: (x) => set({ offsetX: x }),

    rebuildCandles: () => {
      const { ticks, tfIndex } = get();
      set({ candles: aggregateCandles(ticks, TIMEFRAMES[tfIndex].ms) });
    },
  };
});
