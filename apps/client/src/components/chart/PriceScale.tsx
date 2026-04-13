import { formatPrice } from '../../utils/formatters';

interface PriceScaleProps {
  prices: number[];
  height: number;
}

export function PriceScale({ prices, height }: PriceScaleProps) {
  if (prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const step = range / 10;

  const levels = Array.from({ length: 11 }, (_, i) => min + step * i);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-20 bg-bg-panel border-l border-border">
      {levels.map((price, i) => (
        <div
          key={i}
          className="absolute right-0 text-xs font-mono text-text-secondary px-2"
          style={{ top: `${(1 - i / 10) * 100}%` }}
        >
          {formatPrice(price)}
        </div>
      ))}
    </div>
  );
}
