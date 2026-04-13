import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useChartStore } from '../store/chartStore';
import { TIMEFRAMES } from '../types';
import { formatCandleTime } from '../utils/tickUtils';

const PRICE_PANEL_W = 70; // logical px for price scale on the right

interface HoverInfo {
  open: number; high: number; low: number; close: number;
  x: number; visible: boolean;
}

export function CandlestickChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const dragRef   = useRef<{ active: boolean; startX: number; startOff: number }>({
    active: false, startX: 0, startOff: 0,
  });

  const candles     = useChartStore((s) => s.candles);
  const tfIndex     = useChartStore((s) => s.tfIndex);
  const candleWidth = useChartStore((s) => s.candleWidth);
  const offsetX     = useChartStore((s) => s.offsetX);
  const setCandleWidth = useChartStore((s) => s.setCandleWidth);
  const setOffsetX     = useChartStore((s) => s.setOffsetX);

  const [hover, setHover] = useState<HoverInfo>({ open:0, high:0, low:0, close:0, x:0, visible:false });

  // ─── Draw ────────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const cv  = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap || !candles.length) return;

    const dpr   = window.devicePixelRatio || 1;
    const W     = cv.width;
    const H     = cv.height;
    const priceW = PRICE_PANEL_W * dpr;
    const chartW = W - priceW;
    const padT   = 20 * dpr;
    const padB   = 28 * dpr;
    const chartH = H - padT - padB;

    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    const cw   = candleWidth * dpr;
    const gap  = Math.max(dpr, cw * 0.15);
    const step = cw + gap;

    // Clamp offsetX
    const totalW  = candles.length * step;
    const maxOff  = Math.max(0, totalW - chartW * 0.7);
    const clampedOff = Math.max(-chartW * 0.3, Math.min(offsetX * dpr, maxOff));

    const firstIdx = Math.max(0, Math.floor(clampedOff / step));
    const lastIdx  = Math.min(candles.length - 1, firstIdx + Math.ceil(chartW / step) + 2);
    const visible  = candles.slice(firstIdx, lastIdx + 1);
    if (!visible.length) return;

    // Price range
    let maxP = Math.max(...visible.map((c) => c.high));
    let minP = Math.min(...visible.map((c) => c.low));
    const range = maxP - minP || 0.001;
    maxP += range * 0.06;
    minP -= range * 0.06;
    const rng = maxP - minP;

    const py = (p: number) => padT + ((maxP - p) / rng) * chartH;

    // Grid lines + price labels
    ctx.font      = `${10 * dpr}px monospace`;
    ctx.textAlign = 'left';
    const nLines = 6;
    for (let i = 0; i <= nLines; i++) {
      const p = minP + (rng / nLines) * i;
      const y = py(p);
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth   = dpr * 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(chartW, y); ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.fillText(p.toFixed(5), chartW + 4 * dpr, y + 3 * dpr);
    }

    // Price scale background
    ctx.fillStyle = '#161616';
    ctx.fillRect(chartW, 0, priceW, H);

    // Candles
    for (let i = 0; i < visible.length; i++) {
      const c   = visible[i];
      const idx = firstIdx + i;
      const x   = idx * step - clampedOff;
      if (x + cw < 0 || x > chartW) continue;

      const isBull = c.close >= c.open;
      const color  = isBull ? '#26a69a' : '#ef5350';
      const cx     = x + cw / 2;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth   = Math.max(dpr * 0.8, 1);
      ctx.beginPath();
      ctx.moveTo(cx, py(c.high));
      ctx.lineTo(cx, py(c.low));
      ctx.stroke();

      // Body
      const bodyTop = Math.min(py(c.open), py(c.close));
      const bodyH   = Math.max(dpr, Math.abs(py(c.open) - py(c.close)));
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, cw, bodyH);
    }

    // Current price dashed line + label
    const last = candles[candles.length - 1];
    if (last) {
      const ly = py(last.close);
      ctx.strokeStyle = '#888';
      ctx.lineWidth   = 0.5 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(chartW, ly); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#1565c0';
      ctx.fillRect(chartW, ly - 8 * dpr, priceW, 16 * dpr);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(last.close.toFixed(5), chartW + 4 * dpr, ly + 4 * dpr);
    }

    // X-axis time labels
    const tf   = TIMEFRAMES[tfIndex];
    const xLabelEvery = Math.max(1, Math.floor((60 * dpr) / step));
    ctx.fillStyle = '#444';
    ctx.font      = `${9 * dpr}px monospace`;
    ctx.textAlign = 'center';
    for (let i = firstIdx; i <= lastIdx; i += xLabelEvery) {
      if (!candles[i]) continue;
      const x = i * step - clampedOff + cw / 2;
      if (x < 0 || x > chartW) continue;
      const lbl = formatCandleTime(new Date(candles[i].time), tf.ms);
      ctx.fillText(lbl, x, H - 6 * dpr);
    }
  }, [candles, tfIndex, candleWidth, offsetX]);

  // ─── Resize ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const cv   = canvasRef.current;
    if (!wrap || !cv) return;

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      cv.width  = wrap.clientWidth  * dpr;
      cv.height = wrap.clientHeight * dpr;
      cv.style.width  = wrap.clientWidth  + 'px';
      cv.style.height = wrap.clientHeight + 'px';
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  // ─── Redraw on state change ───────────────────────────────────────────────────
  useEffect(() => {
    draw();

    // Auto-scroll to newest candles when timeframe changes
    const wrap = wrapRef.current;
    if (!wrap || !candles.length) return;
    const dpr  = window.devicePixelRatio || 1;
    const step = (candleWidth + Math.max(1, candleWidth * 0.15));
    const totalLogical = candles.length * step;
    const chartLogical = wrap.clientWidth - PRICE_PANEL_W;
    const target = Math.max(0, totalLogical - chartLogical * 0.8);
    setOffsetX(target);
  }, [candles, tfIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { draw(); }, [draw]);

  // ─── Mouse / touch interaction ───────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setCandleWidth(candleWidth + (e.deltaY > 0 ? -1 : 1));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { active: true, startX: e.clientX, startOff: offsetX };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      setOffsetX(dragRef.current.startOff - dx);
    }

    // Crosshair hover info
    const cv   = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const rect  = cv.getBoundingClientRect();
    const mx    = e.clientX - rect.left;
    if (mx > wrap.clientWidth - PRICE_PANEL_W) { setHover((h) => ({ ...h, visible: false })); return; }

    const step = candleWidth + Math.max(1, candleWidth * 0.15);
    const idx  = Math.floor((mx + offsetX) / step);
    if (idx >= 0 && idx < candles.length) {
      const c = candles[idx];
      setHover({ open: c.open, high: c.high, low: c.low, close: c.close, x: mx, visible: true });
    }
  };

  const onMouseUp   = () => { dragRef.current.active = false; };
  const onMouseLeave = () => { setHover((h) => ({ ...h, visible: false })); dragRef.current.active = false; };

  return (
    <div ref={wrapRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}>
      <canvas
        ref={canvasRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ display: 'block' }}
      />

      {/* OHLC overlay */}
      {hover.visible && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(18,18,18,.92)', border: '1px solid #333',
          borderRadius: 4, padding: '4px 10px',
          fontSize: 11, lineHeight: 1.8, pointerEvents: 'none',
          display: 'flex', gap: 12,
        }}>
          <span style={{ color: '#aaa' }}>O <b style={{ color: '#ddd' }}>{hover.open.toFixed(5)}</b></span>
          <span style={{ color: '#aaa' }}>H <b style={{ color: '#26a69a' }}>{hover.high.toFixed(5)}</b></span>
          <span style={{ color: '#aaa' }}>L <b style={{ color: '#ef5350' }}>{hover.low.toFixed(5)}</b></span>
          <span style={{ color: '#aaa' }}>C <b style={{ color: '#fff' }}>{hover.close.toFixed(5)}</b></span>
        </div>
      )}
    </div>
  );
}
