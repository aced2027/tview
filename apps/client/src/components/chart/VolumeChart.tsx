import { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { Candle } from '../../types';

interface VolumeChartProps {
  candles: Candle[];
}

export function VolumeChart({ candles }: VolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 100,
      layout: {
        background: { color: '#0d1117' },
        textColor: '#e6edf3',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#21262d' },
      },
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
    });

    chartRef.current = chart;

    const volumeSeries = chart.addHistogramSeries({
      color: '#58a6ff',
      priceFormat: {
        type: 'volume',
      },
    });

    const volumeData = candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? '#2ea043' : '#f85149'
    }));

    volumeSeries.setData(volumeData);

    return () => {
      chart.remove();
    };
  }, [candles]);

  return <div ref={chartContainerRef} className="w-full" />;
}
