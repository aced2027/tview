import React from 'react';
import { TIMEFRAMES } from '../types';
import { useChartStore } from '../store/chartStore';

const btn: React.CSSProperties = {
  padding: '3px 9px', border: 'none', borderRadius: 4,
  fontSize: 11, cursor: 'pointer',
  background: 'transparent', color: '#666',
  fontFamily: 'inherit', transition: 'all .12s',
};
const activeBtn: React.CSSProperties = { ...btn, background: '#1565c0', color: '#fff' };

export function TimeframeSelector() {
  const tfIndex = useChartStore((s) => s.tfIndex);
  const setTimeframe = useChartStore((s) => s.setTimeframe);

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 2,
      padding: '6px 14px',
      background: '#141414',
      borderBottom: '1px solid #1e1e1e',
      flexShrink: 0,
    }}>
      {TIMEFRAMES.map((tf, i) => (
        <button
          key={tf.label}
          style={i === tfIndex ? activeBtn : btn}
          onClick={() => setTimeframe(i)}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
