import React from 'react';
import { TopBar } from './components/TopBar';
import { TimeframeSelector } from './components/TimeframeSelector';
import { CandlestickChart } from './components/CandlestickChart';
import { useLiveFeed } from './hooks/useLiveFeed';

export default function App() {
  useLiveFeed(); // start live tick feed

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', background: '#111',
        fontFamily: "'Consolas','Courier New',monospace",
        color: '#ccc',
      }}>
        <TopBar />
        <TimeframeSelector />
        <CandlestickChart />
      </div>
    </>
  );
}
