import { useOrderStore } from '../../stores/orderStore';
import { formatPrice, formatPnL } from '../../utils/formatters';

export function PositionTable() {
  const { positions, closePosition } = useOrderStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 border-b border-border text-xs font-semibold">
        Positions ({positions.length})
      </div>
      <div className="text-xs">
        {positions.map(pos => (
          <div key={pos.id} className="p-2 border-b border-border">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{pos.symbol}</span>
              <span className={pos.direction === 'buy' ? 'text-accent-bull' : 'text-accent-bear'}>
                {pos.direction.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>{pos.volume} lots</span>
              <span>{formatPrice(pos.openPrice)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={pos.pnl >= 0 ? 'text-accent-bull' : 'text-accent-bear'}>
                {formatPnL(pos.pnl)}
              </span>
              <button
                onClick={() => closePosition(pos.id, pos.currentPrice)}
                className="px-2 py-0.5 bg-accent-bear rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
