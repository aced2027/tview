import { formatPrice, formatPercent } from '../../utils/formatters';

interface WatchlistItemProps {
  item: {
    symbol: string;
    bid: number;
    ask: number;
    change: number;
    starred: boolean;
  };
  onClick: () => void;
}

export function WatchlistItem({ item, onClick }: WatchlistItemProps) {
  const changeColor = item.change >= 0 ? 'text-accent-bull' : 'text-accent-bear';

  return (
    <div
      onClick={onClick}
      className="px-2 py-1.5 hover:bg-bg-card cursor-pointer border-b border-border text-xs"
    >
      <div className="font-semibold">{item.symbol}</div>
      <div className="flex justify-between font-mono">
        <span>{formatPrice(item.bid)}</span>
        <span className={changeColor}>{formatPercent(item.change)}</span>
      </div>
    </div>
  );
}
