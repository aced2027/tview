# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

This will install all dependencies for both client and server workspaces.

## Running the Application

Start both client and server with one command:
```bash
npm run dev
```

This runs:
- Server on http://localhost:3001
- Client on http://localhost:5173

Or run them separately:
```bash
npm run dev:server  # Start server only
npm run dev:client  # Start client only
```

## Sample Data

Two sample tick files are included:
- `apps/server/data/ticks/EURUSD_sample.csv`
- `apps/server/data/ticks/GBPUSD_sample.csv`

These contain 30 seconds of tick data for testing.

## Adding Your Own Data

Place CSV or JSON tick files in `apps/server/data/ticks/`:

### CSV Format
```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
```

### JSON Format
```json
[
  {"t": 1700000000000, "b": 1.08450, "a": 1.08452, "l": 1.08451, "v": 100}
]
```

File naming: `SYMBOL_anything.csv` (e.g., `USDJPY_2024.csv`)

## Testing

Run all tests:
```bash
npm run test
```

## Building for Production

```bash
npm run build
```

## Troubleshooting

### No symbols detected
- Check that tick files are in `apps/server/data/ticks/`
- Ensure filenames start with 6-letter currency pair (e.g., EURUSD)
- Verify CSV/JSON format is correct

### WebSocket connection failed
- Ensure server is running on port 3001
- Check firewall settings
- Verify VITE_WS_URL in `apps/client/.env`

### Chart not loading
- Open browser console for errors
- Verify tick data format is correct
- Check that symbol exists in watchlist

## Next Steps

1. Add more tick data files
2. Customize chart indicators
3. Adjust replay speed in settings
4. Test paper trading features
5. Explore different timeframes

## Project Structure

```
trading-terminal/
├── apps/
│   ├── client/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── stores/      # Zustand state
│   │   │   ├── hooks/       # React hooks
│   │   │   ├── services/    # API & WebSocket
│   │   │   └── utils/       # Helpers & indicators
│   │   └── package.json
│   └── server/              # Express backend
│       ├── src/
│       │   ├── routes/      # REST endpoints
│       │   ├── services/    # Business logic
│       │   └── websocket/   # WebSocket handler
│       ├── data/ticks/      # Your tick files go here
│       └── package.json
└── package.json             # Monorepo root
```
