import { useState } from 'react';
import { useChartStore } from '../../stores/chartStore';
import { useOrderStore } from '../../stores/orderStore';

export function OrderForm() {
  const { symbol } = useChartStore();
  const { openPosition } = useOrderStore();
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [volume, setVolume] = useState(0.01);
  const [price, setPrice] = useState(0);

  const handleSubmit = () => {
    openPosition({
      symbol,
      direction,
      volume,
      openPrice: price || 1.08,
      currentPrice: price || 1.08,
      openTime: Date.now()
    });
  };

  return (
    <div className="p-3 border-b border-border">
      <div className="text-xs font-semibold mb-2">New Order</div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setDirection('buy')}
            className={`flex-1 py-1 text-xs rounded ${direction === 'buy' ? 'bg-accent-bull' : 'bg-bg-card'}`}
          >
            BUY
          </button>
          <button
            onClick={() => setDirection('sell')}
            className={`flex-1 py-1 text-xs rounded ${direction === 'sell' ? 'bg-accent-bear' : 'bg-bg-card'}`}
          >
            SELL
          </button>
        </div>
        <input
          type="number"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          placeholder="Volume"
          className="w-full px-2 py-1 text-xs bg-bg-card border border-border rounded"
          step="0.01"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-1.5 text-xs font-semibold bg-accent-info rounded hover:opacity-80"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
