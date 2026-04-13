import { useEffect } from 'react';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { useChartStore } from '../../stores/chartStore';
import { getPairs } from '../../services/candlesLocal';
import { WatchlistItem } from './WatchlistItem';

export function Watchlist() {
  const { items, addSymbol } = useWatchlistStore();
  const { setSymbol } = useChartStore();

  useEffect(() => {
    console.log('Loading available currency pairs...');
    try {
      const pairs = getPairs();
      console.log('Pairs loaded:', pairs);
      pairs.forEach(pair => addSymbol(pair));
    } catch (err) {
      console.error('Error loading pairs:', err);
    }
  }, [addSymbol]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b border-border font-semibold text-sm">
        Currency Pairs
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-text-secondary text-sm">
            No pairs loaded
          </div>
        ) : (
          items.map(item => (
            <WatchlistItem
              key={item.symbol}
              item={item}
              onClick={() => setSymbol(item.symbol)}
            />
          ))
        )}
      </div>
    </div>
  );
}
