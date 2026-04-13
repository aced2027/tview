import { useEffect, useRef, useState } from 'react';
import { IChartApi } from 'lightweight-charts';
import { CursorTool } from '../../types';

interface DrawnLine {
  id: string;
  type: 'vertical' | 'horizontal';
  value: number; // time for vertical, price for horizontal
  color: string;
}

interface ChartInteractionLayerProps {
  chart: IChartApi | null;
  activeTool: CursorTool;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ChartInteractionLayer({ chart, activeTool, containerRef }: ChartInteractionLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([]);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [chartCoords, setChartCoords] = useState<{ time: number; price: number } | null>(null);

  // Setup canvas overlay
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const updateCanvasSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [containerRef]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    try {
      const timeScale = chart.timeScale();
      const priceScale = chart.priceScale('right');
      
      const time = timeScale.coordinateToTime(x);
      const price = priceScale.coordinateToPrice(y);

      if (time && price) {
        setChartCoords({ time: time as number, price });
      }
    } catch (err) {
      // Ignore coordinate conversion errors
    }

    // Check for hovered lines (for arrow and eraser tools)
    if (activeTool === 'arrow' || activeTool === 'eraser') {
      let foundHover = false;
      for (const line of drawnLines) {
        if (isNearLine(line, x, y)) {
          setHoveredLine(line.id);
          foundHover = true;
          break;
        }
      }
      if (!foundHover) {
        setHoveredLine(null);
      }
    }
  };

  // Check if mouse is near a line
  const isNearLine = (line: DrawnLine, mouseX: number, mouseY: number): boolean => {
    if (!chart || !canvasRef.current) return false;

    const threshold = 8; // pixels
    const timeScale = chart.timeScale();
    const priceScale = chart.priceScale('right');

    if (line.type === 'vertical') {
      const lineX = timeScale.timeToCoordinate(line.value as any);
      if (lineX === null) return false;
      return Math.abs(mouseX - lineX) < threshold;
    } else {
      const lineY = priceScale.priceToCoordinate(line.value);
      if (lineY === null) return false;
      return Math.abs(mouseY - lineY) < threshold;
    }
  };

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chart || !chartCoords) return;

    if (activeTool === 'cross') {
      // Click = vertical line, Shift+Click = horizontal line
      const newLine: DrawnLine = {
        id: `line-${Date.now()}`,
        type: e.shiftKey ? 'horizontal' : 'vertical',
        value: e.shiftKey ? chartCoords.price : chartCoords.time,
        color: '#2962ff',
      };
      setDrawnLines(prev => [...prev, newLine]);
    } else if (activeTool === 'eraser' && hoveredLine) {
      // Delete the hovered line
      setDrawnLines(prev => prev.filter(line => line.id !== hoveredLine));
      setHoveredLine(null);
    }
  };

  // Clear all lines
  const clearAllLines = () => {
    setDrawnLines([]);
    setHoveredLine(null);
  };

  // Render overlay
  useEffect(() => {
    if (!canvasRef.current || !chart) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const timeScale = chart.timeScale();
    const priceScale = chart.priceScale('right');

    // Draw all lines
    drawnLines.forEach(line => {
      const isHovered = line.id === hoveredLine;
      const color = activeTool === 'eraser' && isHovered ? '#f85149' : line.color;

      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.setLineDash([5, 5]);

      if (line.type === 'vertical') {
        const x = timeScale.timeToCoordinate(line.value as any);
        if (x !== null) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      } else {
        const y = priceScale.priceToCoordinate(line.value);
        if (y !== null) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Show "Click to erase" tooltip
      if (activeTool === 'eraser' && isHovered && mousePos) {
        ctx.fillStyle = '#f85149';
        ctx.font = '12px sans-serif';
        ctx.fillText('Click to erase', mousePos.x + 10, mousePos.y - 10);
      }
    });

    // Draw crosshair for Cross tool
    if (activeTool === 'cross' && mousePos && chartCoords) {
      ctx.strokeStyle = '#758696';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, canvas.height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(canvas.width, mousePos.y);
      ctx.stroke();

      // Draw coordinate labels
      ctx.setLineDash([]);
      ctx.fillStyle = '#363c4e';
      ctx.fillRect(mousePos.x - 60, canvas.height - 25, 120, 20);
      ctx.fillRect(canvas.width - 80, mousePos.y - 10, 75, 20);

      ctx.fillStyle = '#e6edf3';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(new Date(chartCoords.time * 1000).toLocaleTimeString(), mousePos.x, canvas.height - 10);
      ctx.textAlign = 'right';
      ctx.fillText(chartCoords.price.toFixed(5), canvas.width - 5, mousePos.y + 5);
    }

    // Draw dot for Dot tool
    if (activeTool === 'dot' && mousePos && chartCoords) {
      // Draw dot
      ctx.fillStyle = '#758696';
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw coordinate labels (same as cross)
      ctx.setLineDash([]);
      ctx.fillStyle = '#363c4e';
      ctx.fillRect(mousePos.x - 60, canvas.height - 25, 120, 20);
      ctx.fillRect(canvas.width - 80, mousePos.y - 10, 75, 20);

      ctx.fillStyle = '#e6edf3';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(new Date(chartCoords.time * 1000).toLocaleTimeString(), mousePos.x, canvas.height - 10);
      ctx.textAlign = 'right';
      ctx.fillText(chartCoords.price.toFixed(5), canvas.width - 5, mousePos.y + 5);
    }

    // Show coordinates for Arrow tool when hovering a line
    if (activeTool === 'arrow' && hoveredLine && mousePos) {
      const line = drawnLines.find(l => l.id === hoveredLine);
      if (line) {
        ctx.fillStyle = '#2962ff';
        ctx.font = '12px sans-serif';
        const label = line.type === 'vertical' 
          ? `Time: ${new Date(line.value * 1000).toLocaleTimeString()}`
          : `Price: ${line.value.toFixed(5)}`;
        ctx.fillText(label, mousePos.x + 10, mousePos.y - 10);
      }
    }

  }, [chart, drawnLines, hoveredLine, mousePos, chartCoords, activeTool]);

  // Update cursor style
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const cursorStyles: Record<CursorTool, string> = {
      cross: 'crosshair',
      dot: 'crosshair',
      arrow: hoveredLine ? 'pointer' : 'default',
      eraser: hoveredLine ? 'pointer' : 'not-allowed',
    };

    canvasRef.current.style.cursor = cursorStyles[activeTool];
  }, [activeTool, hoveredLine]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 10 }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => {
          setMousePos(null);
          setChartCoords(null);
          setHoveredLine(null);
        }}
      />
      
      {/* Clear all button */}
      {drawnLines.length > 0 && (
        <button
          onClick={clearAllLines}
          className="absolute top-4 right-4 px-3 py-1.5 bg-[#f85149] text-white text-sm rounded hover:bg-[#da3633] transition-colors z-20"
        >
          Clear all ({drawnLines.length})
        </button>
      )}
    </>
  );
}
