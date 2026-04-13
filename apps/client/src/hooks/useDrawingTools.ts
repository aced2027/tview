import { useState, useCallback } from 'react';

interface Drawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'fibonacci' | 'text';
  points: { time: number; price: number }[];
  color: string;
  width: number;
  text?: string;
}

export function useDrawingTools() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);

  const startDrawing = useCallback((type: Drawing['type'], point: { time: number; price: number }) => {
    const newDrawing: Drawing = {
      id: Date.now().toString(),
      type,
      points: [point],
      color: '#58a6ff',
      width: 2
    };
    setActiveDrawing(newDrawing);
  }, []);

  const updateDrawing = useCallback((point: { time: number; price: number }) => {
    if (!activeDrawing) return;
    setActiveDrawing({
      ...activeDrawing,
      points: [...activeDrawing.points, point]
    });
  }, [activeDrawing]);

  const finishDrawing = useCallback(() => {
    if (activeDrawing) {
      setDrawings([...drawings, activeDrawing]);
      setActiveDrawing(null);
    }
  }, [activeDrawing, drawings]);

  const removeDrawing = useCallback((id: string) => {
    setDrawings(drawings.filter(d => d.id !== id));
  }, [drawings]);

  const clearAll = useCallback(() => {
    setDrawings([]);
    setActiveDrawing(null);
  }, []);

  return {
    drawings,
    activeDrawing,
    startDrawing,
    updateDrawing,
    finishDrawing,
    removeDrawing,
    clearAll
  };
}
