import { formatPrice, formatVolume, formatTimestamp } from '../../utils/formatters';
import { Candle } from '../../types';

interface CrosshairTooltipProps {
  candle: Candle | null;
  x: number;
  y: number;
}

export function CrosshairTooltip({ candle, x, y }: CrosshairTooltipProps) {
  if (!candle) return null;

  return (
    <div
      className="fixed bg-bg-panel border border-border rounded px-3 py-2 text-xs font-mono z-50 pointer-events-none"
      style={{ left: x + 10, top: y + 10 }}
    >
      <div className="text-text-secondary mb-1">{formatTimestamp(candle.time * 1000)}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <span className="text-text-secondary">O:</span>
        <span>{formatPrice(candle.open)}</span>
        <span className="text-text-secondary">H:</span>
        <span className="text-accent-bull">{formatPrice(candle.high)}</span>
        <span className="text-text-secondary">L:</span>
        <span className="text-accent-bear">{formatPrice(candle.low)}</span>
        <span className="text-text-secondary">C:</span>
        <span>{formatPrice(candle.close)}</span>
        <span className="text-text-secondary">Vol:</span>
        <span>{formatVolume(candle.volume)}</span>
      </div>
    </div>
  );
}
