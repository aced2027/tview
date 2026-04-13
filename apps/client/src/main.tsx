import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { preloadCommonData } from './services/candlesLocal';
import { useChartStore } from './stores/chartStore';

// Preload common data for faster initial load
console.log('[main] Starting app...');

// Initialize chart state from localStorage
const initChart = async () => {
  console.log('[main] Initializing chart state from storage...');
  useChartStore.getState().initializeFromStorage();
  
  // Preload common pairs in background
  await preloadCommonData().catch(err => {
    console.warn('[main] Preload failed (continuing anyway):', err);
  });
};

initChart();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
