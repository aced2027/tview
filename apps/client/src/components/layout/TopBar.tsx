import { useChartStore } from '../../stores/chartStore';
import { formatPrice, formatPercent } from '../../utils/formatters';

export function TopBar() {
  const { symbol } = useChartStore();

  return (
    <div className="h-12 bg-bg-panel border-b border-border flex items-center px-4 gap-6">
      <div className="font-bold text-lg">Trading Terminal</div>
      <div className="flex items-center gap-4 font-mono text-sm">
        <span className="font-semibold">{symbol}</span>
        <span className="text-text-secondary">•</span>
        <span>Bid: <span className="text-accent-bear">{formatPrice(0)}</span></span>
        <span>Ask: <span className="text-accent-bull">{formatPrice(0)}</span></span>
        <span className="text-text-secondary">•</span>
        <span className="text-accent-bull">{formatPercent(0)}</span>
      </div>
    </div>
  );
}
