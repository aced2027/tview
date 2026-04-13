import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Timeframe, ChartType } from '../types';

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  replaySpeed: number;
  defaultChartType: ChartType;
  defaultTimeframe: Timeframe;
  timezone: string;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setReplaySpeed: (speed: number) => void;
  setDefaultChartType: (type: ChartType) => void;
  setDefaultTimeframe: (tf: Timeframe) => void;
  setTimezone: (tz: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      replaySpeed: 1,
      defaultChartType: 'candlestick',
      defaultTimeframe: '5m',
      timezone: 'UTC',
      setTheme: (theme) => set({ theme }),
      setReplaySpeed: (replaySpeed) => set({ replaySpeed }),
      setDefaultChartType: (defaultChartType) => set({ defaultChartType }),
      setDefaultTimeframe: (defaultTimeframe) => set({ defaultTimeframe }),
      setTimezone: (timezone) => set({ timezone })
    }),
    { name: 'settings-storage' }
  )
);
