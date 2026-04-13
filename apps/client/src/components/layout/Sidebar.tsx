import { Watchlist } from '../watchlist/Watchlist';

export function Sidebar() {
  return (
    <div className="w-[200px] bg-bg-panel border-r border-border flex flex-col">
      <Watchlist />
    </div>
  );
}
