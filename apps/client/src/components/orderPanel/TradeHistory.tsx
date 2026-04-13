import { useOrderStore } from '../../stores/orderStore';
import { formatPrice, formatPnL, formatTimestamp } from '../../utils/formatters';

export function TradeHistory() {
  const { closedTrades } = useOrderStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 border-b border-border text-xs font-semibold">
        Trade History ({closedTrades.length})
      </div>
      <div className="text-xs">
        {closedTrades.map(trade => (
          <div key={trade.id} className="p-2 border-b border-border">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{trade.symbol}</span>
              <span className={trade.direction === 'buy' ? 'text-accent-bull' : 'text-accent-bear'}>
                {trade.direction.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>{trade.volume} lots</span>
              <span>{formatPrice(trade.entryPrice)} → {formatPrice(trade.exitPrice)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={trade.pnl >= 0 ? 'text-accent-bull' : 'text-accent-bear'}>
                {formatPnL(trade.pnl)}
              </span>
              <span className="text-text-secondary text-[10px]">
                {formatTimestamp(trade.exitTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
