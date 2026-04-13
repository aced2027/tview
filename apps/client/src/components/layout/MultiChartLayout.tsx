import { useState } from 'react';
import { ChartContainer } from '../chart/ChartContainer';

type Layout = '1x1' | '2x1' | '2x2' | '1+2';

export function MultiChartLayout() {
  const [layout, setLayout] = useState<Layout>('1x1');

  const renderLayout = () => {
    switch (layout) {
      case '1x1':
        return <ChartContainer />;
      case '2x1':
        return (
          <div className="flex gap-1 h-full">
            <div className="flex-1"><ChartContainer /></div>
            <div className="flex-1"><ChartContainer /></div>
          </div>
        );
      case '2x2':
        return (
          <div className="grid grid-cols-2 gap-1 h-full">
            <ChartContainer />
            <ChartContainer />
            <ChartContainer />
            <ChartContainer />
          </div>
        );
      case '1+2':
        return (
          <div className="flex gap-1 h-full">
            <div className="flex-[2]"><ChartContainer /></div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex-1"><ChartContainer /></div>
              <div className="flex-1"><ChartContainer /></div>
            </div>
          </div>
        );
      default:
        return <ChartContainer />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-10 bg-bg-panel border-b border-border flex items-center px-3 gap-2">
        <span className="text-xs text-text-secondary">Layout:</span>
        {(['1x1', '2x1', '2x2', '1+2'] as Layout[]).map(l => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`px-2 py-1 text-xs rounded ${layout === l ? 'bg-accent-info' : 'bg-bg-card hover:bg-bg-deep'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {renderLayout()}
      </div>
    </div>
  );
}
