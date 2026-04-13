import { useState } from 'react';

interface WatchlistSearchProps {
  symbols: string[];
  onSelect: (symbol: string) => void;
}

export function WatchlistSearch({ symbols, onSelect }: WatchlistSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filtered = symbols.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative p-2 border-b border-border">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Search symbols..."
        className="w-full px-2 py-1 text-xs bg-bg-card border border-border rounded"
      />
      {showResults && query && (
        <div className="absolute top-full left-2 right-2 mt-1 bg-bg-panel border border-border rounded shadow-lg max-h-48 overflow-y-auto z-50">
          {filtered.map(symbol => (
            <div
              key={symbol}
              onClick={() => {
                onSelect(symbol);
                setQuery('');
                setShowResults(false);
              }}
              className="px-2 py-1.5 text-xs hover:bg-bg-card cursor-pointer"
            >
              {symbol}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
