import { useChartStore } from '../../stores/chartStore';
import { Timeframe } from '../../types';
import { TimeframeSelector } from './TimeframeSelector';

export function ChartToolbar() {
  const { chartType, setChartType } = useChartStore();

  const chartTypes = ['candlestick', 'line', 'area', 'bar'] as const;

  return (
    <div className="h-10 bg-bg-panel border-b border-border flex items-center px-3 gap-4">
      <TimeframeSelector />
      <div className="h-6 w-px bg-border" />
      <div className="flex gap-1">
        {chartTypes.map(type => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-2 py-1 text-xs rounded ${
              chartType === type ? 'bg-accent-info' : 'bg-bg-card hover:bg-bg-deep'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
