import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistItem {
  symbol: string;
  bid: number;
  ask: number;
  change: number;
  starred: boolean;
}

interface WatchlistState {
  items: WatchlistItem[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  updatePrice: (symbol: string, bid: number, ask: number) => void;
  toggleStar: (symbol: string) => void;
  clearAll: () => void;
  deduplicateItems: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      items: [],
      addSymbol: (symbol) => set((state) => {
        // Don't add if symbol already exists
        if (state.items.some(i => i.symbol === symbol)) {
          return state;
        }
        return {
          items: [...state.items, { symbol, bid: 0, ask: 0, change: 0, starred: false }]
        };
      }),
      removeSymbol: (symbol) => set((state) => ({
        items: state.items.filter(i => i.symbol !== symbol)
      })),
      updatePrice: (symbol, bid, ask) => set((state) => ({
        items: state.items.map(i => i.symbol === symbol ? { ...i, bid, ask } : i)
      })),
      toggleStar: (symbol) => set((state) => ({
        items: state.items.map(i => i.symbol === symbol ? { ...i, starred: !i.starred } : i)
      })),
      clearAll: () => set({ items: [] }),
      deduplicateItems: () => set((state) => {
        // Remove duplicates and filter out README
        const seen = new Set<string>();
        const uniqueItems = state.items.filter(item => {
          if (item.symbol === 'README' || seen.has(item.symbol)) {
            return false;
          }
          seen.add(item.symbol);
          return true;
        });
        return { items: uniqueItems };
      })
    }),
    { name: 'watchlist-storage' }
  )
);
