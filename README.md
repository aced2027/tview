# Trading Terminal

A full-featured, professional trading terminal built with React and TypeScript. This is a browser-based clone of TradingView/ThinkorSwim that uses local tick data for charting and analysis.

## 🚀 NEW USER? START HERE!

**👉 Read [START_HERE.md](START_HERE.md) for a quick 3-step setup guide.**

**👉 Read [HOW_TO_ADD_YOUR_DATA.md](HOW_TO_ADD_YOUR_DATA.md) to integrate your tick data.**

The system automatically generates candlesticks from your tick data for any timeframe!

## Features

- Real-time-like chart rendering with multiple timeframes
- Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- Multiple chart types (Candlestick, Line, Area, Bar, Heikin-Ashi)
- Watchlist with live price updates
- Paper trading simulation with P&L tracking
- WebSocket-based tick streaming
- Dark theme optimized for trading

## Tech Stack

- Frontend: React 18 + TypeScript + Vite
- Charting: Lightweight Charts (TradingView OSS)
- State: Zustand
- Styling: Tailwind CSS
- Backend: Node.js + Express
- WebSocket: ws
- Data: Local tick files (CSV/JSON/GZIP)

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your tick data (or use included samples)
cp your_ticks.csv apps/server/data/ticks/EURUSD_ticks.csv

# 3. Start the app
npm run dev

# 4. Open browser
http://localhost:5173
```

**Need help with your data format?** See [HOW_TO_ADD_YOUR_DATA.md](HOW_TO_ADD_YOUR_DATA.md)

**Have data in different format?** Use the converter:
```bash
npm run convert your_data.csv EURUSD
```

## Documentation

- **[START_HERE.md](START_HERE.md)** - Quick start guide (read this first!)
- **[HOW_TO_ADD_YOUR_DATA.md](HOW_TO_ADD_YOUR_DATA.md)** - Simple guide to add your tick data
- **[EXAMPLES.md](EXAMPLES.md)** - Real-world conversion examples (MT5, Binance, IB, etc.)
- **[TICK_DATA_GUIDE.md](TICK_DATA_GUIDE.md)** - Detailed format specifications
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
- **[FEATURES.md](FEATURES.md)** - Complete feature list and roadmap

## Tick File Format

The server auto-detects and parses multiple formats:

### CSV Format
```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
1700000001000,1.08451,1.08453,1.08452,150
```

### JSON Format
```json
[
  {"t": 1700000000000, "b": 1.08450, "a": 1.08452, "l": 1.08451, "v": 100},
  {"t": 1700000001000, "b": 1.08451, "a": 1.08453, "l": 1.08452, "v": 150}
]
```

### File Naming Convention

Files must start with the currency pair symbol:
- `EURUSD_ticks_2024-01.csv`
- `GBPUSD_2024.json`
- `USDJPY_ticks.csv.gz`

The symbol is extracted from the filename prefix before the first `_` or `.`

## Supported Timeframes

1s, 5s, 10s, 30s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1D, 1W, 1M

## Environment Variables

### Server (apps/server/.env)
```
SERVER_PORT=3001
TICK_DATA_PATH=./data/ticks
```

### Client (apps/client/.env)
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## API Endpoints

- `GET /api/symbols` - List all detected symbols
- `GET /api/candles/:symbol?tf=5m&from=&to=` - Get OHLCV candles
- `GET /api/ticks/:symbol?from=&to=&limit=500` - Get raw ticks
- `GET /api/symbols/:symbol/info` - Get symbol metadata
- `WS /stream` - WebSocket for live tick streaming

## How Candlesticks Are Generated

**You provide:** Raw tick data (timestamp, bid, ask, last, volume)

**System automatically:**
1. Groups ticks into time buckets based on selected timeframe
2. Calculates OHLCV for each bucket:
   - Open: First tick price in period
   - High: Highest tick price in period
   - Low: Lowest tick price in period
   - Close: Last tick price in period
   - Volume: Sum of all tick volumes

**Result:** Perfect candlesticks on any timeframe (1s to 1M), generated on-demand!

No manual conversion needed - just add your tick files and select a timeframe.

## Replay Speed

Change tick replay speed in Settings (top-right gear icon). Available speeds: 1x, 2x, 5x, 10x

## Paper Trading

The application includes a simulated paper trading engine:
- Starting balance: $10,000
- Market orders only (limit/stop coming soon)
- Real-time P&L calculation
- Position tracking
- Trade history

All trading data persists in browser localStorage.

## Helpful Commands

```bash
# Development
npm run dev                    # Start both client & server
npm run dev:server            # Server only
npm run dev:client            # Client only

# Data Management
npm run convert input.csv EURUSD    # Convert any format to required format
npm run validate your_file.csv      # Validate tick data format

# Testing & Building
npm run test                   # Run all tests
npm run build                  # Build for production
```

## Development

### Run Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
```

### Project Structure
```
trading-terminal/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
└── package.json         # Monorepo root
```

## Requirements

- Node.js 20+
- Modern browser with WebSocket support

## License

MIT
