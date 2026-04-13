import { create } from 'zustand';

export type DrawingTool = 
  // Cursors
  | 'cursor' | 'cross' | 'dot' | 'arrow' | 'eraser'
  // Trend Lines
  | 'trendline' | 'ray' | 'infoline' | 'extendedline' | 'trendangle' 
  | 'horizontal' | 'horizontalray' | 'vertical' | 'crossline' | 'parallelchannel' | 'regression'
  // Gann & Fibonacci
  | 'pitchfork' | 'schiffpitchfork' | 'gannfan' | 'gannsquare' | 'gannbox' 
  | 'fibretrace' | 'fibextension' | 'fibtimezone'
  // Shapes
  | 'brush' | 'highlighter' | 'rectangle' | 'circle' | 'ellipse' | 'path' | 'polyline' | 'triangle'
  // Annotations
  | 'text' | 'anchoredtext' | 'note' | 'anchorednote' | 'callout' | 'balloon' 
  | 'pricelabel' | 'pricenote' | 'arrowmarker'
  // Patterns
  | 'xabcdpattern' | 'abcdpattern' | 'trianglepattern' | 'threedrives' | 'headshoulders' | 'elliottwave'
  // Prediction & Measurement
  | 'longposition' | 'shortposition' | 'forecast' | 'daterange' | 'pricerange' 
  | 'datepricerange' | 'barspattern' | 'ghostfeed'
  // Icons
  | 'heart' | 'star' | 'flag' | 'check' | 'x' | 'question' | 'exclamation' | 'lightbulb'
  // Utilities
  | 'measure' | 'zoom' | 'favorites' | 'none';

export type MagnetMode = 'off' | 'weak' | 'strong';

interface DrawingObject {
  id: string;
  type: DrawingTool;
  points: Array<{ x: number; y: number }>;
  properties: {
    color?: string;
    width?: number;
    opacity?: number;
    text?: string;
    [key: string]: any;
  };
  locked?: boolean;
  visible?: boolean;
  timestamp: number;
}

interface DrawingState {
  // Active tool
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;

  // Drawing canvas state
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;

  // Magnet mode
  magnetMode: MagnetMode;
  setMagnetMode: (mode: MagnetMode) => void;
  toggleMagnetMode: () => void;

  // Mode settings
  stayInDrawMode: boolean;
  setStayInDrawMode: (stay: boolean) => void;
  
  drawingsLocked: boolean;
  setDrawingsLocked: (locked: boolean) => void;
  
  showDrawings: boolean;
  setShowDrawings: (show: boolean) => void;

  // Drawing objects
  drawings: DrawingObject[];
  addDrawing: (drawing: DrawingObject) => void;
  removeDrawing: (id: string) => void;
  updateDrawing: (id: string, updates: Partial<DrawingObject>) => void;
  clearAllDrawings: () => void;
  toggleDrawingVisibility: (id: string) => void;
  toggleDrawingLock: (id: string) => void;

  // Tool properties
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  
  opacity: number;
  setOpacity: (opacity: number) => void;

  // Favorites
  favoriteTools: DrawingTool[];
  addToFavorites: (tool: DrawingTool) => void;
  removeFromFavorites: (tool: DrawingTool) => void;
  isFavorite: (tool: DrawingTool) => boolean;

  // Undo/Redo
  history: DrawingObject[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  pushHistory: (drawings: DrawingObject[]) => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Active tool
  activeTool: 'cursor',
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Drawing state
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  // Magnet mode
  magnetMode: 'off',
  setMagnetMode: (mode) => set({ magnetMode: mode }),
  toggleMagnetMode: () => {
    const current = get().magnetMode;
    const next = current === 'off' ? 'weak' : current === 'weak' ? 'strong' : 'off';
    set({ magnetMode: next });
  },

  // Mode settings
  stayInDrawMode: false,
  setStayInDrawMode: (stay) => set({ stayInDrawMode: stay }),

  drawingsLocked: false,
  setDrawingsLocked: (locked) => set({ drawingsLocked: locked }),

  showDrawings: true,
  setShowDrawings: (show) => set({ showDrawings: show }),

  // Drawing objects
  drawings: [],
  addDrawing: (drawing) => {
    const current = get().drawings;
    const updated = [...current, drawing];
    set({ drawings: updated });
    get().pushHistory(updated);
  },

  removeDrawing: (id) => {
    const current = get().drawings;
    const updated = current.filter(d => d.id !== id);
    set({ drawings: updated });
    get().pushHistory(updated);
  },

  updateDrawing: (id, updates) => {
    const current = get().drawings;
    const updated = current.map(d => d.id === id ? { ...d, ...updates } : d);
    set({ drawings: updated });
  },

  clearAllDrawings: () => {
    set({ drawings: [] });
    get().pushHistory([]);
  },

  toggleDrawingVisibility: (id) => {
    set({
      drawings: get().drawings.map(d =>
        d.id === id ? { ...d, visible: !d.visible } : d
      )
    });
  },

  toggleDrawingLock: (id) => {
    set({
      drawings: get().drawings.map(d =>
        d.id === id ? { ...d, locked: !d.locked } : d
      )
    });
  },

  // Tool properties
  strokeColor: '#3b82f6',
  setStrokeColor: (color) => set({ strokeColor: color }),

  strokeWidth: 2,
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  opacity: 1,
  setOpacity: (opacity) => set({ opacity: Math.min(1, Math.max(0, opacity)) }),

  // Favorites
  favoriteTools: ['cursor', 'trendline', 'horizontal', 'text', 'rectangle'],
  addToFavorites: (tool) => {
    const current = get().favoriteTools;
    if (!current.includes(tool)) {
      set({ favoriteTools: [...current, tool] });
    }
  },

  removeFromFavorites: (tool) => {
    set({ favoriteTools: get().favoriteTools.filter(t => t !== tool) });
  },

  isFavorite: (tool) => get().favoriteTools.includes(tool),

  // Undo/Redo
  history: [[]],
  historyIndex: 0,
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ 
        historyIndex: newIndex,
        drawings: history[newIndex]
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ 
        historyIndex: newIndex,
        drawings: history[newIndex]
      });
    }
  },

  pushHistory: (drawings) => {
    const { history, historyIndex } = get();
    // Remove any future history if we've moved back and then made a new change
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(drawings);
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
}));
