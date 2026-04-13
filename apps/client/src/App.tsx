import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { StatusBar } from './components/layout/StatusBar';
import { ChartContainer } from './components/chart/ChartContainer';
import { RightSidebar } from './components/layout/RightSidebar';
import { WatchlistPanel } from './components/watchlist/WatchlistPanel';

type Panel = 'none' | 'watchlist' | 'alerts' | 'news' | 'chat' | 'data' | 'settings' | 'calendar' | 'help';

export default function App() {
  const [activePanel, setActivePanel] = useState<Panel>('watchlist');

  return (
    <div className="h-screen flex flex-col bg-bg-deep text-text-primary font-sans">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col">
          <ChartContainer />
        </main>
        <div className="flex">
          <WatchlistPanel isOpen={activePanel === 'watchlist'} />
          <RightSidebar onPanelChange={setActivePanel} activePanel={activePanel} />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
