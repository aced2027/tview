import { useChartStore } from '../../stores/chartStore';
import { useWatchlistStore } from '../../stores/watchlistStore';

export function StatusBar() {
  const symbol = useChartStore((state) => state.symbol);
  const candles = useChartStore((state) => state.candles);
  const items = useWatchlistStore((state) => state.items);
  
  const currentItem = items.find(item => item.symbol === symbol);
  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  
  const spread = currentItem ? Math.abs(currentItem.ask - currentItem.bid) : 0;
  const lastTick = lastCandle ? new Date(lastCandle.time * 1000).toLocaleTimeString() : '--:--:--';
  
  return (
    <div className="h-6 bg-bg-panel border-t border-border flex items-center px-4 text-xs text-text-secondary gap-4">
      <span>Spread: {spread.toFixed(5)}</span>
      <span>•</span>
      <span>Last Tick: {lastTick}</span>
      <span>•</span>
      <span>Bid: {currentItem?.bid.toFixed(5) || '0.00000'}</span>
      <span>•</span>
      <span>Ask: {currentItem?.ask.toFixed(5) || '0.00000'}</span>
      <span>•</span>
      <span className="text-accent-bull">Connected</span>
    </div>
  );
}
