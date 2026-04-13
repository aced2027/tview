import { useChartStore } from '../../stores/chartStore';
import { Timeframe } from '../../types';

const TIMEFRAMES: Timeframe[] = [
  '1min', '5min', '15min', '30min', '1h', '4h', '1d', '1w'
];

export function TimeframeSelector() {
  const { timeframe, setTimeframe, loading } = useChartStore();

  return (
    <div className="flex gap-1">
      {TIMEFRAMES.map(tf => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          disabled={loading}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
            timeframe === tf 
              ? 'bg-accent-info text-white' 
              : loading
              ? 'bg-bg-card text-text-secondary opacity-50 cursor-not-allowed'
              : 'bg-bg-card text-text-secondary hover:bg-bg-deep hover:text-text-primary'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
