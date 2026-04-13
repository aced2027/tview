import { useState } from 'react';

type Panel = 'none' | 'watchlist' | 'alerts' | 'news' | 'chat' | 'data' | 'settings' | 'calendar' | 'help';

interface RightSidebarProps {
  onPanelChange: (panel: Panel) => void;
  activePanel: Panel;
}

export function RightSidebar({ onPanelChange, activePanel }: RightSidebarProps) {
  const [notificationCount] = useState(1);

  const tools = [
    { 
      id: 'watchlist' as Panel, 
      label: 'Watchlist',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    { 
      id: 'alerts' as Panel, 
      label: 'Alerts',
      badge: notificationCount,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    { 
      id: 'data' as Panel, 
      label: 'Object Tree',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    { 
      id: 'chat' as Panel, 
      label: 'Chat',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
  ];

  const bottomTools = [
    { 
      id: 'settings' as Panel, 
      label: 'Settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-6 0l-4.2 4.2"/>
        </svg>
      )
    },
    { 
      id: 'news' as Panel, 
      label: 'News',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 11a9 9 0 0 1 9 9"/>
          <path d="M4 4a16 16 0 0 1 16 16"/>
          <circle cx="5" cy="19" r="1"/>
        </svg>
      )
    },
    { 
      id: 'calendar' as Panel, 
      label: 'Economic Calendar',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    { 
      id: 'help' as Panel, 
      label: 'Help',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
  ];

  return (
    <div className="w-12 bg-bg-deep border-l border-border flex flex-col items-center py-2">
      {/* Top tools */}
      <div className="flex flex-col items-center gap-0.5 flex-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onPanelChange(tool.id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activePanel === tool.id
                ? 'bg-accent-info text-white' 
                : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
            }`}
            title={tool.label}
          >
            {tool.icon}
            {tool.badge && tool.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-bear text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {tool.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-border my-2" />

      {/* Bottom tools */}
      <div className="flex flex-col items-center gap-0.5">
        {bottomTools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onPanelChange(tool.id)}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activePanel === tool.id
                ? 'bg-accent-info text-white' 
                : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
