import { create } from 'zustand';
import { Timeframe, ChartType, Candle, Tick } from '../types';
import { aggregateTicksToCandles } from '../utils/candleAggregator';
import { loadCandles, AVAILABLE_PAIRS, AVAILABLE_TIMEFRAMES } from '../services/candlesLocal';

const STORAGE_KEY_CHART = 'chart_state';

interface ChartState {
  symbol: string;
  timeframe: Timeframe;
  chartType: ChartType;
  candles: Candle[];
  ticks: Tick[];
  loading: boolean;
  error: string | null;
  availablePairs: string[];
  availableTimeframes: Timeframe[];
  
  setSymbol: (symbol: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  setChartType: (type: ChartType) => void;
  setCandles: (candles: Candle[]) => void;
  setTicks: (ticks: Tick[]) => void;
  loadCandlesForSymbol: (symbol: string, timeframe: Timeframe) => Promise<void>;
  aggregateCandles: () => void;
  initializeFromStorage: () => void;
}

// Get saved state from localStorage
function getSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CHART);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        symbol: parsed.symbol || 'AUDUSD',
        timeframe: parsed.timeframe || '1h'
      };
    }
  } catch (e) {
    console.warn('[chartStore] Failed to read from localStorage:', e);
  }
  return { symbol: 'AUDUSD', timeframe: '1h' };
}

// Save state to localStorage
function saveState(symbol: string, timeframe: Timeframe) {
  try {
    localStorage.setItem(STORAGE_KEY_CHART, JSON.stringify({ symbol, timeframe }));
    console.log(`[chartStore] Saved state: ${symbol} @ ${timeframe}`);
  } catch (e) {
    console.warn('[chartStore] Failed to save to localStorage:', e);
  }
}

const initialState = getSavedState();

export const useChartStore = create<ChartState>((set, get) => ({
  symbol: initialState.symbol,
  timeframe: initialState.timeframe,
  chartType: 'candlestick',
  candles: [],
  ticks: [],
  loading: false,
  error: null,
  availablePairs: AVAILABLE_PAIRS,
  availableTimeframes: AVAILABLE_TIMEFRAMES,
  
  initializeFromStorage: () => {
    const saved = getSavedState();
    set({ symbol: saved.symbol, timeframe: saved.timeframe });
    // Load candles immediately
    get().loadCandlesForSymbol(saved.symbol, saved.timeframe);
  },
  
  setSymbol: (symbol) => {
    set({ symbol, candles: [], ticks: [] });
    saveState(symbol, get().timeframe);
    // Load candles for new symbol
    get().loadCandlesForSymbol(symbol, get().timeframe);
  },
  
  setTimeframe: (timeframe) => {
    set({ timeframe });
    saveState(get().symbol, timeframe);
    // Load candles for new timeframe
    get().loadCandlesForSymbol(get().symbol, timeframe);
  },
  
  setChartType: (chartType) => set({ chartType }),
  
  setCandles: (candles) => set({ candles: [...candles] }),
  
  setTicks: (ticks) => {
    set({ ticks });
    get().aggregateCandles();
  },
  
  loadCandlesForSymbol: async (symbol: string, timeframe: Timeframe) => {
    set({ loading: true, error: null });
    try {
      console.log(`[chartStore] Loading candles for ${symbol} ${timeframe}`);
      const startTime = performance.now();
      
      const candles = await loadCandles(symbol, timeframe);
      
      const loadTime = performance.now() - startTime;
      console.log(`[chartStore] ✓ Loaded ${candles.length} candles in ${loadTime.toFixed(2)}ms`);
      
      set({ candles, loading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[chartStore] Failed to load candles:', error);
      set({ error: errorMsg, loading: false });
    }
  },
  
  aggregateCandles: () => {
    const { ticks, timeframe } = get();
    if (ticks.length === 0) {
      set({ candles: [] });
      return;
    }
    
    console.log(`[chartStore] Aggregating ${ticks.length} ticks to ${timeframe} candles`);
    const candles = aggregateTicksToCandles(ticks, timeframe);
    console.log(`[chartStore] Generated ${candles.length} candles`);
    set({ candles: [...candles] });
  }
}));
