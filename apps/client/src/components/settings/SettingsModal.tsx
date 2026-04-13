import { Modal } from '../shared/Modal';
import { useSettingsStore } from '../../stores/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    theme,
    replaySpeed,
    defaultChartType,
    defaultTimeframe,
    setTheme,
    setReplaySpeed,
    setDefaultChartType,
    setDefaultTimeframe
  } = useSettingsStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full px-3 py-2 bg-bg-card border border-border rounded"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Replay Speed</label>
          <select
            value={replaySpeed}
            onChange={(e) => setReplaySpeed(Number(e.target.value))}
            className="w-full px-3 py-2 bg-bg-card border border-border rounded"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Default Chart Type</label>
          <select
            value={defaultChartType}
            onChange={(e) => setDefaultChartType(e.target.value as any)}
            className="w-full px-3 py-2 bg-bg-card border border-border rounded"
          >
            <option value="candlestick">Candlestick</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="heikin-ashi">Heikin-Ashi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Default Timeframe</label>
          <select
            value={defaultTimeframe}
            onChange={(e) => setDefaultTimeframe(e.target.value as any)}
            className="w-full px-3 py-2 bg-bg-card border border-border rounded"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1D">1 Day</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
