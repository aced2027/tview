import { useState } from 'react';

type DrawingTool = string;

interface ToolCategory {
  id: string;
  name: string;
  tools: { id: string; label: string }[];
}

export function DrawingToolbar() {
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [magnetMode, setMagnetMode] = useState<'off' | 'weak' | 'strong'>('off');
  const [stayInDrawMode, setStayInDrawMode] = useState(false);
  const [showDrawings, setShowDrawings] = useState(true);
  const [drawingsLocked, setDrawingsLocked] = useState(false);

  const categories: ToolCategory[] = [
    {
      id: 'cursors',
      name: 'Cursors',
      tools: [
        { id: 'cursor', label: 'Cursor' },
        { id: 'cross', label: 'Cross' },
        { id: 'dot', label: 'Dot' },
        { id: 'arrow', label: 'Arrow' },
        { id: 'eraser', label: 'Eraser' },
      ]
    },
    {
      id: 'trendlines',
      name: 'Trend Lines',
      tools: [
        { id: 'trendline', label: 'Trend Line' },
        { id: 'ray', label: 'Ray' },
        { id: 'infoline', label: 'Info Line' },
        { id: 'extendedline', label: 'Extended Line' },
        { id: 'trendangle', label: 'Trend Angle' },
        { id: 'horizontal', label: 'Horizontal Line' },
        { id: 'horizontalray', label: 'Horizontal Ray' },
        { id: 'vertical', label: 'Vertical Line' },
        { id: 'crossline', label: 'Cross Line' },
        { id: 'parallelchannel', label: 'Parallel Channel' },
        { id: 'regression', label: 'Regression Trend' },
      ]
    },
    {
      id: 'fibonacci',
      name: 'Gann & Fibonacci',
      tools: [
        { id: 'pitchfork', label: 'Pitchfork' },
        { id: 'schiffpitchfork', label: 'Schiff Pitchfork' },
        { id: 'gannfan', label: 'Gann Fan' },
        { id: 'gannsquare', label: 'Gann Square' },
        { id: 'gannbox', label: 'Gann Box' },
        { id: 'fibretrace', label: 'Fibonacci Retracement' },
        { id: 'fibextension', label: 'Trend-Based Fib Extension' },
        { id: 'fibtimezone', label: 'Fib Time Zone' },
      ]
    },
    {
      id: 'shapes',
      name: 'Geometric Shapes',
      tools: [
        { id: 'brush', label: 'Brush' },
        { id: 'highlighter', label: 'Highlighter' },
        { id: 'rectangle', label: 'Rectangle' },
        { id: 'circle', label: 'Circle' },
        { id: 'ellipse', label: 'Ellipse' },
        { id: 'path', label: 'Path' },
        { id: 'polyline', label: 'Polyline' },
        { id: 'triangle', label: 'Triangle' },
      ]
    },
    {
      id: 'annotations',
      name: 'Annotation Tools',
      tools: [
        { id: 'text', label: 'Text' },
        { id: 'anchoredtext', label: 'Anchored Text' },
        { id: 'note', label: 'Note' },
        { id: 'anchorednote', label: 'Anchored Note' },
        { id: 'callout', label: 'Callout' },
        { id: 'balloon', label: 'Balloon' },
        { id: 'pricelabel', label: 'Price Label' },
        { id: 'pricenote', label: 'Price Note' },
        { id: 'arrowmarker', label: 'Arrow Marker' },
      ]
    },
    {
      id: 'patterns',
      name: 'Patterns',
      tools: [
        { id: 'xabcdpattern', label: 'XABCD Pattern' },
        { id: 'abcdpattern', label: 'ABCD Pattern' },
        { id: 'trianglepattern', label: 'Triangle Pattern' },
        { id: 'threedrives', label: 'Three Drives' },
        { id: 'headshoulders', label: 'Head and Shoulders' },
        { id: 'elliottwave', label: 'Elliott Wave' },
      ]
    },
    {
      id: 'prediction',
      name: 'Prediction & Measurement',
      tools: [
        { id: 'longposition', label: 'Long Position' },
        { id: 'shortposition', label: 'Short Position' },
        { id: 'forecast', label: 'Forecast' },
        { id: 'daterange', label: 'Date Range' },
        { id: 'pricerange', label: 'Price Range' },
        { id: 'datepricerange', label: 'Date and Price Range' },
        { id: 'barspattern', label: 'Bars Pattern' },
        { id: 'ghostfeed', label: 'Ghost Feed' },
      ]
    },
    {
      id: 'icons',
      name: 'Icons',
      tools: [
        { id: 'heart', label: 'Heart' },
        { id: 'star', label: 'Star' },
        { id: 'flag', label: 'Flag' },
        { id: 'check', label: 'Check' },
        { id: 'x', label: 'X' },
        { id: 'question', label: 'Question' },
        { id: 'exclamation', label: 'Exclamation' },
        { id: 'lightbulb', label: 'Light Bulb' },
      ]
    },
  ];

  const getIconForTool = (toolId: string) => {
    const iconMap: { [key: string]: string } = {
      cursor: '🖱',
      cross: '✟',
      dot: '●',
      arrow: '→',
      trendline: '/',
      horizontal: '—',
      rectangle: '▭',
      circle: '●',
      text: 'T',
      heart: '♥',
      star: '★',
      flag: '⚑',
      check: '✓',
      x: '✕',
      measure: '📏',
      zoom: '🔍',
      magnet: '🧲',
      lock: '🔒',
      eye: '👁',
      trash: '🗑',
      favorites: '⭐',
    };
    return iconMap[toolId] || '●';
  };

  return (
    <div className="h-full w-16 bg-bg-deep border-r border-border flex flex-col">
      {/* Main Tools */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 p-2">
        {/* Measure */}
        <button
          onClick={() => setActiveTool('measure')}
          className={`w-12 h-12 flex items-center justify-center rounded transition-colors text-xl ${
            activeTool === 'measure' 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title="Measure"
        >
          {getIconForTool('measure')}
        </button>

        {/* Zoom */}
        <button
          onClick={() => setActiveTool('zoom')}
          className={`w-12 h-12 flex items-center justify-center rounded transition-colors text-xl ${
            activeTool === 'zoom' 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title="Zoom"
        >
          {getIconForTool('zoom')}
        </button>

        {/* Drawing Categories */}
        {categories.map(category => (
          <div key={category.id}>
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className={`w-12 h-12 flex items-center justify-center rounded transition-colors text-lg relative ${
                expandedCategory === category.id || category.tools.some(t => t.id === activeTool)
                  ? 'bg-accent-info text-white' 
                  : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
              }`}
              title={category.name}
            >
              {category.name.charAt(0)}
              {expandedCategory === category.id && (
                <div className="absolute bottom-0 right-0 text-xs">▼</div>
              )}
            </button>

            {/* Expanded Tools */}
            {expandedCategory === category.id && (
              <div className="ml-1 mt-1 border-l border-border pl-1 flex flex-col gap-1 bg-bg-deep rounded">
                {category.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-11 h-9 flex items-center justify-center rounded text-xs px-1 transition-colors ${
                      activeTool === tool.id 
                        ? 'bg-accent-info text-white' 
                        : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
                    }`}
                    title={tool.label}
                  >
                    <div className="text-center truncate text-xs">{tool.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-border pt-2 pb-2 px-2 flex flex-col gap-1">
        {/* Magnet Mode */}
        <div className="relative">
          <button
            onClick={() => setMagnetMode(magnetMode === 'off' ? 'weak' : magnetMode === 'weak' ? 'strong' : 'off')}
            className={`w-12 h-10 flex items-center justify-center rounded transition-colors text-lg ${
              magnetMode !== 'off' 
                ? 'bg-accent-info text-white' 
                : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
            }`}
            title={`Magnet: ${magnetMode}`}
          >
            {getIconForTool('magnet')}
          </button>
        </div>

        {/* Stay in Drawing Mode */}
        <button
          onClick={() => setStayInDrawMode(!stayInDrawMode)}
          className={`w-12 h-10 flex items-center justify-center rounded transition-colors ${
            stayInDrawMode 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title="Stay in Drawing Mode"
        >
          ✏️
        </button>

        {/* Lock All Drawings */}
        <button
          onClick={() => setDrawingsLocked(!drawingsLocked)}
          className={`w-12 h-10 flex items-center justify-center rounded transition-colors text-lg ${
            drawingsLocked 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title={drawingsLocked ? 'Unlock' : 'Lock All'}
        >
          {getIconForTool('lock')}
        </button>

        {/* Show/Hide */}
        <button
          onClick={() => setShowDrawings(!showDrawings)}
          className={`w-12 h-10 flex items-center justify-center rounded transition-colors text-lg ${
            !showDrawings 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title={showDrawings ? 'Hide' : 'Show'}
        >
          {getIconForTool('eye')}
        </button>

        {/* Delete */}
        <button
          onClick={() => console.log('delete')}
          className="w-12 h-10 flex items-center justify-center rounded transition-colors text-lg text-text-secondary hover:bg-bg-panel hover:text-red-400"
          title="Delete"
        >
          {getIconForTool('trash')}
        </button>

        {/* Favorites */}
        <button
          onClick={() => setActiveTool('favorites')}
          className={`w-12 h-10 flex items-center justify-center rounded transition-colors text-lg ${
            activeTool === 'favorites' 
              ? 'bg-accent-info text-white' 
              : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
          }`}
          title="Favorites"
        >
          {getIconForTool('favorites')}
        </button>
      </div>
    </div>
  );
}
