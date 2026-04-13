import { useEffect, useRef, useState } from 'react';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { useChartStore } from '../../stores/chartStore';
import { api } from '../../services/api';

interface WatchlistPanelProps {
  isOpen: boolean;
}

export function WatchlistPanel({ isOpen }: WatchlistPanelProps) {
  const { items, addSymbol, deduplicateItems } = useWatchlistStore();
  const { setSymbol, symbol: activeSymbol } = useChartStore();
  const [filter, setFilter] = useState('');
  const hasLoaded = useRef(false);

  // Deduplicate on mount
  useEffect(() => {
    deduplicateItems();
  }, [deduplicateItems]);

  useEffect(() => {
    // Guard: only load once, even with Strict Mode or async rehydration
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    console.log('WatchlistPanel: Loading symbols from API...');
    api.getSymbols().then(symbols => {
      console.log('WatchlistPanel: Received symbols:', symbols);
      
      // Filter out README and only add symbols that have real tick data
      const realDataSymbols = symbols.filter((s: string) => 
        s !== 'README' && s !== 'DOWNLO' && ['AUDUSD', 'EURUSD', 'GBPUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'].includes(s)
      );
      
      console.log('WatchlistPanel: Adding real data symbols:', realDataSymbols);
      realDataSymbols.forEach((s: string) => {
        addSymbol(s);
      });
    }).catch(err => {
      console.error('WatchlistPanel: Error loading symbols:', err);
    });
  }, []); // Empty deps - run once on mount

  const filteredItems = items.filter(item => 
    item.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-bg-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Watchlist</h2>
          <div className="flex gap-2">
            <button className="text-text-secondary hover:text-text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button className="text-text-secondary hover:text-text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className="text-text-secondary hover:text-text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search symbols..."
          className="w-full px-3 py-1.5 text-sm bg-bg-deep border border-border rounded focus:outline-none focus:border-accent-info"
        />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-text-secondary border-b border-border">
        <div>Symbol</div>
        <div className="text-right">Last</div>
        <div className="text-right">Chg</div>
        <div className="text-right">Chg%</div>
      </div>

      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.map(item => {
          const isActive = item.symbol === activeSymbol;
          const changeColor = item.change >= 0 ? 'text-accent-bull' : 'text-accent-bear';
          
          return (
            <div
              key={item.symbol}
              onClick={() => setSymbol(item.symbol)}
              className={`grid grid-cols-4 gap-2 px-3 py-2 text-sm cursor-pointer border-b border-border hover:bg-bg-card transition-colors ${
                isActive ? 'bg-bg-card' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold">
                  {item.symbol.substring(0, 2)}
                </div>
                <span className="font-semibold">{item.symbol}</span>
              </div>
              <div className="text-right font-mono">
                {item.bid > 0 ? item.bid.toFixed(5) : '---'}
              </div>
              <div className={`text-right font-mono ${changeColor}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(3)}
              </div>
              <div className={`text-right font-mono ${changeColor}`}>
                {item.change >= 0 ? '+' : ''}{(item.change * 100).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Quick Actions */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-text-secondary mb-2">
          Real Tick Data Available (2026)
        </div>
        <div className="flex gap-2 text-xs flex-wrap">
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">AUDUSD</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">EURUSD</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">GBPUSD</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">NZDUSD</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">USDCAD</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">USDCHF</span>
          <span className="px-2 py-1 bg-accent-bull/20 text-accent-bull rounded">USDJPY</span>
        </div>
      </div>
    </div>
  );
}
