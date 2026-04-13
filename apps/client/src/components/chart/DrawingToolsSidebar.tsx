import { useState } from 'react';

type CursorTool = 'cross' | 'dot' | 'arrow' | 'eraser';
type TrendTool = 'trendline' | 'ray' | 'horizontal-line' | 'horizontal-ray' | 'vertical-line' | 'parallel-channel' | 'regression-trend' | 'flat-top-bottom' | 'disjoint-channel' | 'pitchfork' | 'schiff-pitchfork' | 'modified-schiff-pitchfork' | 'inside-pitchfork';

interface DrawingToolsSidebarProps {
  onToolSelect?: (tool: CursorTool | TrendTool) => void;
}

export function DrawingToolsSidebar({ onToolSelect }: DrawingToolsSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<'cursor' | 'trend' | null>(null);
  const [activeTool, setActiveTool] = useState<CursorTool | TrendTool>('cross');
  const [favorites, setFavorites] = useState<Set<CursorTool | TrendTool>>(new Set(['cross', 'eraser', 'parallel-channel']));

  const handleToolSelect = (tool: CursorTool | TrendTool) => {
    setActiveTool(tool);
    onToolSelect?.(tool);
    // Close sidebar after selection
    setIsExpanded(false);
    setExpandedCategory(null);
  };

  const handleIconClick = (category: 'cursor' | 'trend', defaultTool: CursorTool | TrendTool) => {
    // If clicking the active category, toggle sidebar
    if (isExpanded && expandedCategory === category) {
      setIsExpanded(false);
      setExpandedCategory(null);
    } else {
      // Open sidebar and show this category
      setIsExpanded(true);
      setExpandedCategory(category);
    }
  };

  const toggleFavorite = (tool: CursorTool | TrendTool, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(tool)) {
        next.delete(tool);
      } else {
        next.add(tool);
      }
      return next;
    });
  };

  // Icon bar tools (categories)
  const iconBarTools = [
    {
      id: 'cursor',
      name: 'Cursors',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      )
    },
    {
      id: 'trend',
      name: 'Trend Lines',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      )
    }
  ];

  // All cursor tools for the expanded panel
  const allCursorTools = [
    {
      id: 'cross' as CursorTool,
      name: 'Cross',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      )
    },
    {
      id: 'dot' as CursorTool,
      name: 'Dot',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="6" y1="18" x2="12" y2="6" />
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'arrow' as CursorTool,
      name: 'Arrow',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 5 L5 15 L8 12 L11 18 L13 17 L10 11 L15 11 Z" />
        </svg>
      )
    },
    {
      id: 'eraser' as CursorTool,
      name: 'Eraser',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 20H7L3 16L13 6L21 14L17 18" />
          <line x1="10" y1="10" x2="17" y2="17" />
        </svg>
      )
    }
  ];

  // All trend line tools
  const allTrendTools = [
    {
      id: 'trendline' as TrendTool,
      name: 'Trend Line',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      )
    },
    {
      id: 'ray' as TrendTool,
      name: 'Ray',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="18" r="2" />
          <circle cx="14" cy="10" r="2" />
          <line x1="6" y1="18" x2="14" y2="10" />
          <line x1="14" y1="10" x2="20" y2="4" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      id: 'horizontal-line' as TrendTool,
      name: 'Horizontal Line',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="2" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'main'
    },
    {
      id: 'horizontal-ray' as TrendTool,
      name: 'Horizontal Ray',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="3" y1="12" x2="21" y2="12" />
          <circle cx="3" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'main'
    },
    {
      id: 'vertical-line' as TrendTool,
      name: 'Vertical Line',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="3" x2="12" y2="21" />
          <circle cx="12" cy="3" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'main'
    }
  ];

  // Channel tools
  const channelTools = [
    {
      id: 'parallel-channel' as TrendTool,
      name: 'Parallel Channel',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="4" y1="16" x2="16" y2="4" />
          <line x1="8" y1="20" x2="20" y2="8" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="4" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'channels'
    },
    {
      id: 'regression-trend' as TrendTool,
      name: 'Regression Trend',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 18 L10 12 L14 14 L20 6" />
          <path d="M4 16 L10 10 L14 12 L20 4" strokeDasharray="2 2" />
          <path d="M4 20 L10 14 L14 16 L20 8" strokeDasharray="2 2" />
        </svg>
      ),
      category: 'channels'
    },
    {
      id: 'flat-top-bottom' as TrendTool,
      name: 'Flat Top/Bottom',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="4" y1="16" x2="12" y2="16" />
          <line x1="12" y1="16" x2="20" y2="12" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'channels'
    },
    {
      id: 'disjoint-channel' as TrendTool,
      name: 'Disjoint Channel',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="4" y1="16" x2="10" y2="10" />
          <line x1="14" y1="14" x2="20" y2="8" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" />
          <circle cx="14" cy="14" r="1.5" fill="currentColor" />
        </svg>
      ),
      category: 'channels'
    }
  ];

  // Pitchfork tools
  const pitchforkTools = [
    {
      id: 'pitchfork' as TrendTool,
      name: 'Pitchfork',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="12" y1="4" x2="4" y2="20" />
          <line x1="12" y1="4" x2="20" y2="20" />
        </svg>
      ),
      category: 'pitchforks'
    },
    {
      id: 'schiff-pitchfork' as TrendTool,
      name: 'Schiff Pitchfork',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="6" x2="12" y2="20" />
          <line x1="12" y1="6" x2="4" y2="20" />
          <line x1="12" y1="6" x2="20" y2="20" />
          <line x1="8" y1="4" x2="12" y2="6" strokeDasharray="2 2" />
        </svg>
      ),
      category: 'pitchforks'
    },
    {
      id: 'modified-schiff-pitchfork' as TrendTool,
      name: 'Modified Schiff Pitchfork',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="8" x2="12" y2="20" />
          <line x1="12" y1="8" x2="4" y2="20" />
          <line x1="12" y1="8" x2="20" y2="20" />
          <line x1="10" y1="4" x2="12" y2="8" strokeDasharray="2 2" />
        </svg>
      ),
      category: 'pitchforks'
    },
    {
      id: 'inside-pitchfork' as TrendTool,
      name: 'Inside Pitchfork',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="6" x2="12" y2="18" />
          <line x1="12" y1="6" x2="6" y2="18" />
          <line x1="12" y1="6" x2="18" y2="18" />
          <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
        </svg>
      ),
      category: 'pitchforks'
    }
  ];

  // Combine all trend tools
  const allTrendToolsCombined = [...allTrendTools, ...channelTools, ...pitchforkTools];

  // Get current category tools
  const getCurrentTools = () => {
    if (expandedCategory === 'cursor') return allCursorTools;
    if (expandedCategory === 'trend') return allTrendToolsCombined;
    return [];
  };

  const currentTools = getCurrentTools();
  const categoryName = expandedCategory === 'cursor' ? 'Cursors' : expandedCategory === 'trend' ? 'Trend Line Tools' : 'Drawing Tools';

  // Check if we should show category headers
  const showCategoryHeaders = expandedCategory === 'trend';

  // Icon-only vertical sidebar + expandable panel
  return (
    <div className="h-full flex relative">
      {/* Icon bar - always visible */}
      <div className="h-full w-14 bg-[#1e222d] border-r border-[#2a2e39] flex flex-col font-sans z-10">
        {/* Tools list - icons only */}
        <div className="flex-1 overflow-y-auto py-2">
          {iconBarTools.map((category) => {
            const isActive = expandedCategory === category.id;

            return (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => handleIconClick(category.id as 'cursor' | 'trend', category.id === 'cursor' ? 'cross' : 'trendline')}
                  className={`w-full h-14 flex items-center justify-center transition-colors relative ${
                    isActive
                      ? 'bg-[#2a2e39] text-white'
                      : 'text-[#787b86] hover:bg-[#2a2e39]/50 hover:text-white'
                  }`}
                  title={category.name}
                >
                  {category.icon}
                  
                  {/* Active indicator - left border */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2962ff] rounded-r" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded panel - shows when isExpanded is true */}
      {isExpanded && expandedCategory && (
        <div className="absolute left-14 top-0 w-64 bg-[#2a2e39] border-r border-[#30363d] shadow-2xl z-20 flex flex-col">
          {/* Category title */}
          <div className="px-4 py-3 border-b border-[#30363d]">
            <h3 className="text-sm text-[#d1d4dc] font-medium">{categoryName}</h3>
          </div>

          {/* Tools list */}
          <div className="max-h-[600px] overflow-y-auto">
            {showCategoryHeaders ? (
              <>
                {/* Main trend tools */}
                {allTrendTools.map((tool) => {
                  const isActive = activeTool === tool.id;
                  const isFavorite = favorites.has(tool.id);

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full h-9 flex items-center gap-2 px-4 transition-colors group ${
                        isActive
                          ? 'bg-[#1e222d] text-white'
                          : 'text-[#d1d4dc] hover:bg-[#1e222d]/50'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-[#787b86] group-hover:text-white'
                      }`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 text-left text-xs">
                        {tool.name}
                      </div>
                      {isFavorite && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f7931a">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                  );
                })}

                {/* CHANNELS section */}
                <div className="px-4 py-2 text-[10px] text-[#787b86] font-semibold tracking-wider border-t border-[#30363d] mt-1">
                  CHANNELS
                </div>
                {channelTools.map((tool) => {
                  const isActive = activeTool === tool.id;
                  const isFavorite = favorites.has(tool.id);

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full h-9 flex items-center gap-2 px-4 transition-colors group ${
                        isActive
                          ? 'bg-[#1e222d] text-white'
                          : 'text-[#d1d4dc] hover:bg-[#1e222d]/50'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-[#787b86] group-hover:text-white'
                      }`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 text-left text-xs">
                        {tool.name}
                      </div>
                      {isFavorite && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f7931a">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                  );
                })}

                {/* PITCHFORKS section */}
                <div className="px-4 py-2 text-[10px] text-[#787b86] font-semibold tracking-wider border-t border-[#30363d] mt-1">
                  PITCHFORKS
                </div>
                {pitchforkTools.map((tool) => {
                  const isActive = activeTool === tool.id;
                  const isFavorite = favorites.has(tool.id);

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full h-9 flex items-center gap-2 px-4 transition-colors group ${
                        isActive
                          ? 'bg-[#1e222d] text-white'
                          : 'text-[#d1d4dc] hover:bg-[#1e222d]/50'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-[#787b86] group-hover:text-white'
                      }`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 text-left text-xs">
                        {tool.name}
                      </div>
                      {isFavorite && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f7931a">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              /* Cursor tools - no categories */
              currentTools.map((tool) => {
                const isActive = activeTool === tool.id;
                const isFavorite = favorites.has(tool.id);

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`w-full h-10 flex items-center gap-3 px-4 transition-colors group ${
                      isActive
                        ? 'bg-[#1e222d] text-white'
                        : 'text-[#d1d4dc] hover:bg-[#1e222d]/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-[#787b86] group-hover:text-white'
                    }`}>
                      {tool.icon}
                    </div>

                    {/* Tool name */}
                    <div className="flex-1 text-left text-sm">
                      {tool.name}
                    </div>

                    {/* Favorite star */}
                    {isFavorite && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f7931a">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
