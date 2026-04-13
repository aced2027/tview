import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useChartStore } from '../../stores/chartStore';
import { useChartData } from '../../hooks/useChartData';
import { ChartToolbar } from './ChartToolbar';
import { DrawingToolsSidebar } from './DrawingToolsSidebar';
import { ChartInteractionLayer } from './ChartInteractionLayer';

type CursorTool = 'cross' | 'dot' | 'arrow' | 'eraser';
type TrendTool = 'trendline' | 'ray' | 'horizontal' | 'parallel-channel';
type DrawingTool = CursorTool | TrendTool;

export function ChartContainer() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const renderRef = useRef<number>(0);
  const [activeTool, setActiveTool] = useState<DrawingTool>('cross');
  
  // Subscribe to store values individually for proper reactivity
  const symbol = useChartStore((state) => state.symbol);
  const timeframe = useChartStore((state) => state.timeframe);
  const candles = useChartStore((state) => state.candles);
  const loading = useChartStore((state) => state.loading);
  
  // Trigger data fetching (only when symbol changes)
  useChartData(symbol);

  // Create chart + series once on mount
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('Chart container ref is null');
      return;
    }

    console.log('[ChartContainer] Creating chart');
    const startTime = performance.now();
    
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#0d1117' },
        textColor: '#e6edf3',
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' },
      },
      crosshair: {
        mode: 1, // Hidden mode - we'll draw our own custom crosshair
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Create series once
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#2ea043',
      downColor: '#f85149',
      borderVisible: false,
      wickUpColor: '#2ea043',
      wickDownColor: '#f85149',
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;
    
    const createTime = performance.now() - startTime;
    console.log(`[ChartContainer] ✓ Chart created in ${createTime.toFixed(2)}ms`);

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup to prevent memory leaks
    return () => {
      console.log('[ChartContainer] Destroying chart');
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // Create chart + series once

  // Update data when candles change
  useEffect(() => {
    if (!seriesRef.current) {
      console.warn('[ChartContainer] seriesRef is null – chart not yet ready');
      return;
    }
    
    if (!candles || candles.length === 0) {
      console.log('[ChartContainer] No candles to render yet');
      return;
    }

    console.log(`[ChartContainer] Rendering ${candles.length} candles for ${symbol} @ ${timeframe}`);
    const renderStart = performance.now();
    
    // Convert candles to lightweight-charts format
    const chartCandles = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    
    seriesRef.current.setData(chartCandles as any);
    renderRef.current += 1;
    
    // Fit content with a small delay to ensure rendering is complete
    setTimeout(() => {
      if (chartRef.current) {
        const fitStart = performance.now();
        chartRef.current.timeScale().fitContent();
        const fitTime = performance.now() - fitStart;
        const totalRenderTime = performance.now() - renderStart;
        console.log(`[ChartContainer] ✓ Rendered ${candles.length} candles in ${totalRenderTime.toFixed(2)}ms (fit: ${fitTime.toFixed(2)}ms)`);
      }
    }, 10);
    
  }, [candles, symbol, timeframe]);

  return (
    <div className="flex-1 flex flex-col">
      <ChartToolbar />
      <div className="flex-1 flex relative bg-bg-deep">
        {/* Left Sidebar - Drawing Tools */}
        <DrawingToolsSidebar onToolSelect={setActiveTool} />
        
        {/* Chart Container */}
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="absolute inset-0" />
          
          {/* Interaction Layer */}
          <ChartInteractionLayer 
            chart={chartRef.current} 
            activeTool={activeTool}
            containerRef={chartContainerRef}
          />
        </div>
        
        {/* Loading overlay - only show if actually loading and no candles */}
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-deep/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-block mb-2">
                <div className="w-8 h-8 border-4 border-accent-info border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-text-secondary">
                Loading {symbol} ({timeframe})...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
