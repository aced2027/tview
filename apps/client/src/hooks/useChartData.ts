import { useEffect, useRef } from 'react';
import { useChartStore } from '../stores/chartStore';

export function useChartData(symbol: string) {
  const timeframe = useChartStore((state) => state.timeframe);
  const loadCandlesForSymbol = useChartStore((state) => state.loadCandlesForSymbol);
  const prevSymbolRef = useRef<string>(symbol);

  useEffect(() => {
    let active = true;

    async function loadData() {
      // Only load if symbol actually changed
      if (symbol === prevSymbolRef.current) {
        return;
      }
      prevSymbolRef.current = symbol;
      
      console.log(`[useChartData] Loading candles for ${symbol} ${timeframe}`);
      
      if (!active) {
        console.log('[useChartData] Component unmounted before loading');
        return;
      }

      try {
        // Load candles directly from local data
        await loadCandlesForSymbol(symbol, timeframe);
        console.log(`[useChartData] ✓ Candles loaded successfully`);
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[useChartData] Failed to load candles:', msg);
      }
    }

    loadData();
    
    return () => {
      active = false;
    };
  }, [symbol, timeframe, loadCandlesForSymbol]); // Re-fetch when symbol or timeframe changes
}
