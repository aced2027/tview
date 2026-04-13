import { useState } from 'react';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../../utils/indicators';

interface Indicator {
  id: string;
  name: string;
  type: 'overlay' | 'subchart';
  visible: boolean;
  color: string;
  params: Record<string, number>;
}

export function IndicatorPanel() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [showModal, setShowModal] = useState(false);

  const availableIndicators = [
    { name: 'SMA', type: 'overlay', params: { period: 20 } },
    { name: 'EMA', type: 'overlay', params: { period: 21 } },
    { name: 'RSI', type: 'subchart', params: { period: 14 } },
    { name: 'MACD', type: 'subchart', params: { fast: 12, slow: 26, signal: 9 } },
    { name: 'Bollinger Bands', type: 'overlay', params: { period: 20, stdDev: 2 } },
  ];

  const addIndicator = (name: string, type: string, params: Record<string, number>) => {
    setIndicators([...indicators, {
      id: Date.now().toString(),
      name,
      type: type as 'overlay' | 'subchart',
      visible: true,
      color: '#58a6ff',
      params
    }]);
    setShowModal(false);
  };

  const removeIndicator = (id: string) => {
    setIndicators(indicators.filter(i => i.id !== id));
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-xs bg-bg-card hover:bg-bg-deep rounded"
      >
        Indicators
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-panel border border-border rounded-lg w-96 max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold">Add Indicator</h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {availableIndicators.map((ind, i) => (
                <div
                  key={i}
                  onClick={() => addIndicator(ind.name, ind.type, ind.params)}
                  className="p-3 mb-2 bg-bg-card hover:bg-bg-deep rounded cursor-pointer"
                >
                  <div className="font-semibold text-sm">{ind.name}</div>
                  <div className="text-xs text-text-secondary">{ind.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 ml-2">
        {indicators.map(ind => (
          <div key={ind.id} className="flex items-center gap-1 px-2 py-1 bg-bg-card rounded text-xs">
            <span>{ind.name}</span>
            <button onClick={() => removeIndicator(ind.id)} className="text-text-secondary hover:text-accent-bear">✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
