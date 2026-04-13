import { Timeframe } from '../types';

export function setupKeyboardShortcuts(handlers: {
  setTimeframe: (tf: Timeframe) => void;
  toggleCrosshair: () => void;
  fitContent: () => void;
  focusSearch: () => void;
  undo: () => void;
  redo: () => void;
  buy: () => void;
  sell: () => void;
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Timeframe shortcuts (Alt + number)
    if (e.altKey) {
      const tfMap: Record<string, Timeframe> = {
        '1': '1m', '2': '5m', '3': '15m', '4': '30m',
        '5': '1h', '6': '4h', '7': '1D', '8': '1W'
      };
      if (tfMap[e.key]) {
        e.preventDefault();
        handlers.setTimeframe(tfMap[e.key]);
      }
    }

    // Single key shortcuts
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          handlers.toggleCrosshair();
          break;
        case 'f':
          e.preventDefault();
          handlers.fitContent();
          break;
        case '/':
          e.preventDefault();
          handlers.focusSearch();
          break;
        case 'b':
          e.preventDefault();
          handlers.buy();
          break;
        case 's':
          e.preventDefault();
          handlers.sell();
          break;
      }
    }

    // Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          handlers.undo();
          break;
        case 'y':
          e.preventDefault();
          handlers.redo();
          break;
      }
    }

    // Escape
    if (e.key === 'Escape') {
      // Handle modal close, drawing cancel, etc.
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}
