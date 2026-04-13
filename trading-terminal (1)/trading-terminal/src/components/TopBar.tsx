import React from 'react';
import { useChartStore } from '../store/chartStore';

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '7px 14px',
    background: '#161616',
    borderBottom: '1px solid #222',
    flexShrink: 0,
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%', background: '#26a69a',
    animation: 'pulse 1.5s infinite',
  },
  symbol: { fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 1 },
  label: { fontSize: 12, color: '#555' },
  bid: { fontSize: 13, color: '#ef5350', fontWeight: 600 },
  ask: { fontSize: 13, color: '#26a69a', fontWeight: 600 },
  spread: { fontSize: 11, color: '#555' },
  right: { marginLeft: 'auto', fontSize: 11, color: '#444' },
};

const SPREAD = 0.00012;

export function TopBar() {
  const candles = useChartStore((s) => s.candles);
  const last  = candles[candles.length - 1];
  const first = candles[0];

  const close  = last?.close  ?? 1.09000;
  const open1d = first?.open  ?? close;
  const pct    = first ? ((close - open1d) / open1d * 100).toFixed(2) : '0.00';
  const isPos  = parseFloat(pct) >= 0;

  return (
    <div style={styles.bar}>
      <div style={styles.dot} />
      <span style={styles.symbol}>EUR/USD</span>
      <span style={styles.label}>Bid</span>
      <span style={styles.bid}>{close.toFixed(5)}</span>
      <span style={styles.label}>Ask</span>
      <span style={styles.ask}>{(close + SPREAD).toFixed(5)}</span>
      <span style={styles.spread}>Spread: {(SPREAD * 10000).toFixed(1)} pips</span>
      <span style={{ ...styles.spread, color: isPos ? '#26a69a' : '#ef5350' }}>
        {isPos ? '+' : ''}{pct}%
      </span>
      <span style={styles.right}>{candles.length} candles</span>
    </div>
  );
}
