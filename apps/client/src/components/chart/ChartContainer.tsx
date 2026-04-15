import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, MouseEventParams, UTCTimestamp, TickMarkType } from 'lightweight-charts';
import { useChartStore } from '../../stores/chartStore';
import { useChartData } from '../../hooks/useChartData';
import { ChartToolbar } from './ChartToolbar';
import { DrawingToolsSidebar } from './DrawingToolsSidebar';
import { ChartInteractionLayer } from './ChartInteractionLayer';
import { CrosshairTooltip } from './CrosshairTooltip';
import { DrawingTool, CursorTool, TrendTool, Candle, Timeframe } from '../../types';

// TradingView-style time formatting
const formatTimeLabel = (time: number, timeframe: Timeframe): string => {
  const date = new Date(time * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Intraday: show time
  if (['1s', '5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h'].includes(timeframe)) {
    return `${hours}:${minutes}`;
  }

  // Daily: show date
  if (['1D', '1d'].includes(timeframe)) {
    return `${month}/${day}`;
  }

  // Weekly: show date
  if (['1W', '1w'].includes(timeframe)) {
    return `${month}/${day}`;
  }

  // Monthly: show month/year
  if (['1M'].includes(timeframe)) {
    return `${month}/${year}`;
  }

  return `${hours}:${minutes}`;
};

// TradingView-style date formatting for crosshair
const formatDateLabel = (time: number, timeframe: Timeframe): string => {
  const date = new Date(time * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Intraday: show full date and time
  if (['1s', '5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h'].includes(timeframe)) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours}:${minutes}:${seconds}`;
  }

  // Daily/Weekly: show date only
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

// TradingView-style price formatting (scientific notation for large numbers)
const formatPrice = (price: number): string => {
  if (price >= 10000) {
    return price.toFixed(2);
  }
  if (price >= 1000) {
    return price.toFixed(3);
  }
  if (price >= 1) {
    return price.toFixed(5);
  }
  if (price >= 0.1) {
    return price.toFixed(5);
  }
  return price.toFixed(5);
};

// Tick mark formatter for time axis (TradingView style)
// Called by lightweight-charts with (time, type, locale)
const tickMarkFormatter = (time: UTCTimestamp, type: TickMarkType, locale: string): string => {
  const date = new Date(time * 1000);

  // Determine the tick mark type (year, month, day, time, etc.)
  if (type === TickMarkType.Year) {
    return date.getFullYear().toString();
  }
  if (type === TickMarkType.Month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }
  if (type === TickMarkType.DayOfMonth) {
    return date.getDate().toString();
  }
  if (type === TickMarkType.Time) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  if (type === TickMarkType.TimeWithSeconds) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Fallback
  return date.toLocaleDateString(locale);
};

// Get default visible bars based on timeframe (TradingView-style auto-fit)
const getDefaultVisibleBars = (timeframe: Timeframe): number => {
  const intradayBars: Record<string, number> = {
    '1s': 100,
    '5s': 100,
    '10s': 100,
    '30s': 80,
    '1m': 100,
    '5m': 80,
    '15m': 60,
    '30m': 50,
    '1h': 50,
    '2h': 40,
    '4h': 30,
    '6h': 25,
    '12h': 20,
  };
  const dailyBars: Record<string, number> = {
    '1D': 100,
    '1d': 100,
    '1W': 52,
    '1w': 52,
    '1M': 24,
  };

  return intradayBars[timeframe] || dailyBars[timeframe] || 50;
};

// Zoom step for each action (TradingView-style)
const ZOOM_STEP = 1.5;
const SCROLL_STEP = 0.5;

export function ChartContainer() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const renderRef = useRef<number>(0);
  const [activeTool, setActiveTool] = useState<DrawingTool>('cross');
  const [crosshairData, setCrosshairData] = useState<{
    candle: Candle | null;
    x: number;
    y: number;
  } | null>(null);

  // Subscribe to store values individually for proper reactivity
  const symbol = useChartStore((state) => state.symbol);
  const timeframe = useChartStore((state) => state.timeframe);
  const candles = useChartStore((state) => state.candles);
  const loading = useChartStore((state) => state.loading);

  // Trigger data fetching (only when symbol changes)
  useChartData(symbol);

  // Zoom functions for toolbar buttons (TradingView-style)
  const zoomIn = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange) return;

    const currentRange = logicalRange.to - logicalRange.from;
    const newRange = Math.max(10, currentRange / ZOOM_STEP);
    const center = (logicalRange.from + logicalRange.to) / 2;

    timeScale.setVisibleLogicalRange({
      from: center - newRange / 2,
      to: center + newRange / 2,
    });
  }, []);

  const zoomOut = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange) return;

    const currentRange = logicalRange.to - logicalRange.from;
    const newRange = currentRange * ZOOM_STEP;
    const maxRange = candles.length * 2;
    const clampedRange = Math.min(newRange, maxRange);
    const center = (logicalRange.from + logicalRange.to) / 2;

    timeScale.setVisibleLogicalRange({
      from: center - clampedRange / 2,
      to: center + clampedRange / 2,
    });
  }, [candles.length]);

  const fitContent = useCallback(() => {
    if (!chartRef.current || candles.length === 0) return;

    const visibleBars = getDefaultVisibleBars(timeframe);
    const lastBar = candles.length - 1;
    const firstBar = Math.max(0, lastBar - visibleBars + 1);

    chartRef.current.timeScale().setVisibleLogicalRange({
      from: firstBar,
      to: lastBar + 5,
    });
  }, [timeframe, candles.length]);

  const resetZoom = useCallback(() => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  }, []);

  // Scroll/pan functions
  const scrollRight = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange) return;

    const scrollAmount = (logicalRange.to - logicalRange.from) * SCROLL_STEP;
    timeScale.setVisibleLogicalRange({
      from: logicalRange.from + scrollAmount,
      to: logicalRange.to + scrollAmount,
    });
  }, []);

  const scrollLeft = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange) return;

    const scrollAmount = (logicalRange.to - logicalRange.from) * SCROLL_STEP;
    const newFrom = Math.max(0, logicalRange.from - scrollAmount);
    const newTo = logicalRange.to - scrollAmount;
    timeScale.setVisibleLogicalRange({
      from: newFrom,
      to: newTo,
    });
  }, []);

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
        textColor: '#9ca3af',
        fontSize: 11,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      },
      grid: {
        vertLines: { color: '#1e2228' },
        horzLines: { color: '#1e2228' },
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
        vertLine: {
          visible: true,
          color: '#758696',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: '#2962ff',
        },
        horzLine: {
          visible: true,
          color: '#758696',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: '#2962ff',
        },
      },
      timeScale: {
        borderColor: '#30363d',
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 5,
        barSpacing: 6,
        minBarSpacing: 0.5,
        tickMarkFormatter: tickMarkFormatter,
      },
      rightPriceScale: {
        borderColor: '#30363d',
        borderVisible: true,
        alignLabels: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScroll: {
        mouseWheel: true,           // Enable mouse wheel scrolling
        pressedMouseMove: true,     // Enable drag to scroll
        horzTouchDrag: true,        // Enable horizontal touch drag
        vertTouchDrag: true,        // Enable vertical touch drag
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,               // Enable time axis scaling with mouse drag
          price: true,              // Enable price axis scaling with mouse drag
        },
        mouseWheel: true,           // Enable mouse wheel zooming
        pinch: true,                // Enable pinch to zoom
        axisDoubleClickReset: {
          time: true,               // Double-click to reset time axis
          price: true,              // Double-click to reset price axis
        },
      },
    });

    // Create series once
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#2ea043',
      downColor: '#f85149',
      borderVisible: false,
      wickUpColor: '#2ea043',
      wickDownColor: '#f85149',
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // Add crosshair move handler
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !param.point) {
        setCrosshairData(null);
        return;
      }

      const data = param.seriesData.get(candleSeries);
      if (data) {
        setCrosshairData({
          candle: data as unknown as Candle,
          x: param.point.x,
          y: param.point.y
        });
      }
    });

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
    
    // Fit content with proper visible range based on timeframe (TradingView-style)
    setTimeout(() => {
      if (chartRef.current && candles.length > 0) {
        const fitStart = performance.now();

        // Get the default visible bars for this timeframe
        const visibleBars = getDefaultVisibleBars(timeframe);

        // Calculate visible range to show approximately the right number of candles
        const timeScale = chartRef.current.timeScale();

        // Set visible range to show appropriate number of bars
        const lastBar = candles.length - 1;
        const firstBar = Math.max(0, lastBar - visibleBars + 1);

        timeScale.setVisibleLogicalRange({
          from: firstBar,
          to: lastBar + 5, // Small buffer on the right
        });

        const fitTime = performance.now() - fitStart;
        const totalRenderTime = performance.now() - renderStart;
        console.log(`[ChartContainer] ✓ Rendered ${candles.length} candles in ${totalRenderTime.toFixed(2)}ms (fit: ${fitTime.toFixed(2)}ms)`);
      }
    }, 50);
    
  }, [candles, symbol, timeframe]);

  return (
    <div className="flex-1 flex flex-col">
      <ChartToolbar />
      <div className="flex-1 flex relative bg-bg-deep">
        {/* Left Sidebar - Drawing Tools */}
        <DrawingToolsSidebar onToolSelect={setActiveTool as (tool: any) => void} />
        
        {/* Chart Container */}
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="absolute inset-0" />
          
          {/* Interaction Layer */}
          <ChartInteractionLayer
            chart={chartRef.current}
            activeTool={activeTool as any}
            containerRef={chartContainerRef}
          />
          
          {/* Crosshair Tooltip */}
          {crosshairData && (
            <CrosshairTooltip
              candle={crosshairData.candle}
              x={crosshairData.x}
              y={crosshairData.y}
            />
          )}
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
