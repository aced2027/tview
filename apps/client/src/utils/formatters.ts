export function formatPrice(price: number, decimals = 5): string {
  return price.toFixed(decimals);
}

export function formatPips(pips: number): string {
  return pips >= 0 ? `+${pips.toFixed(1)}` : pips.toFixed(1);
}

export function formatPnL(pnl: number): string {
  return pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toFixed(0);
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}
