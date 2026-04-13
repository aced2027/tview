import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Position, ClosedTrade } from '../types';

interface OrderState {
  balance: number;
  positions: Position[];
  closedTrades: ClosedTrade[];
  openPosition: (pos: Omit<Position, 'id' | 'pnl' | 'pips'>) => void;
  closePosition: (id: string, exitPrice: number) => void;
  updatePositionPrice: (id: string, currentPrice: number) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      balance: 10000,
      positions: [],
      closedTrades: [],
      openPosition: (pos) => set((state) => ({
        positions: [...state.positions, {
          ...pos,
          id: Date.now().toString(),
          pnl: 0,
          pips: 0
        }]
      })),
      closePosition: (id, exitPrice) => set((state) => {
        const pos = state.positions.find(p => p.id === id);
        if (!pos) return state;

        const pips = pos.direction === 'buy' 
          ? (exitPrice - pos.openPrice) / 0.0001
          : (pos.openPrice - exitPrice) / 0.0001;
        const pnl = pips * pos.volume * 10;

        return {
          positions: state.positions.filter(p => p.id !== id),
          closedTrades: [...state.closedTrades, {
            id: pos.id,
            symbol: pos.symbol,
            direction: pos.direction,
            volume: pos.volume,
            entryPrice: pos.openPrice,
            exitPrice,
            entryTime: pos.openTime,
            exitTime: Date.now(),
            pnl,
            pips
          }],
          balance: state.balance + pnl
        };
      }),
      updatePositionPrice: (id, currentPrice) => set((state) => ({
        positions: state.positions.map(p => {
          if (p.id !== id) return p;
          const pips = p.direction === 'buy'
            ? (currentPrice - p.openPrice) / 0.0001
            : (p.openPrice - currentPrice) / 0.0001;
          return { ...p, currentPrice, pnl: pips * p.volume * 10, pips };
        })
      }))
    }),
    { name: 'order-storage' }
  )
);
