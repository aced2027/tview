# 🚀 Trading Terminal - START HERE

## What You Have

A complete, professional trading terminal (TradingView/ThinkorSwim clone) that:
- ✅ Generates candlesticks automatically from your tick data
- ✅ Supports all timeframes (1s to 1M)
- ✅ Includes technical indicators and drawing tools
- ✅ Has paper trading simulation
- ✅ Works with local data (no paid APIs needed)

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your Tick Data

**Option A: Use Sample Data (Test First)**
```bash
# Sample data is already included!
# Just start the app (next step)
```

**Option B: Add Your Own Data**
```bash
# Copy your tick CSV/JSON files to:
cp your_ticks.csv apps/server/data/ticks/EURUSD_ticks.csv

# IMPORTANT: Filename MUST start with 6-letter symbol
# ✅ EURUSD_ticks.csv
# ✅ GBPUSD_data.csv
# ❌ ticks_EURUSD.csv (wrong)
```

### 3. Start the App
```bash
npm run dev
```

Then open: **http://localhost:5173**

That's it! Your candlesticks will be generated automatically.

---

## Your Tick Data Format

Your CSV should look like this:
```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
1700000001000,1.08451,1.08453,1.08452,150
```

**Key Requirements:**
- **timestamp:** Unix milliseconds (13 digits, not 10)
- **bid:** Bid price
- **ask:** Ask price
- **last:** Last price (optional - will use mid if missing)
- **volume:** Tick volume (optional - defaults to 100)

**Don't have bid/ask?** No problem! Use the converter:
```bash
node scripts/convert-ticks.js your_data.csv EURUSD
```

---

## How Candlesticks Are Generated

**You provide:** Raw tick data (timestamp, bid, ask, last, volume)

**System automatically:**
1. Groups ticks into time buckets (1s, 5s, 1m, 5m, 1h, 1D, etc.)
2. Calculates OHLCV for each bucket:
   - **Open:** First tick price in period
   - **High:** Highest tick price in period
   - **Low:** Lowest tick price in period
   - **Close:** Last tick price in period
   - **Volume:** Sum of all tick volumes

**Result:** Perfect candlesticks on any timeframe, generated on-demand!

---

## What You Can Do

### Charting
- 📊 View candlesticks on 12 timeframes (1s to 1M)
- 📈 Switch chart types (Candlestick, Line, Area, Bar, Heikin-Ashi)
- 🔍 Zoom, pan, and scroll through history
- 📉 Volume sub-chart

### Technical Analysis
- 📐 5 indicators: SMA, EMA, RSI, MACD, Bollinger Bands
- ✏️ 6 drawing tools: Trend lines, Horizontal/Vertical, Rectangle, Fibonacci, Text
- 🎨 Customize colors and parameters

### Trading Simulation
- 💰 Paper trading with $10,000 starting balance
- 📊 Real-time P&L tracking
- 📈 Position management
- 📜 Trade history

### Live Streaming
- 🔴 WebSocket tick streaming (simulated real-time)
- ⚡ Configurable replay speed (1x, 2x, 5x, 10x)
- 🔄 Auto-loop when data exhausted

---

## File Structure

```
trading-terminal/
├── apps/
│   ├── client/                    # React frontend
│   └── server/                    # Express backend
│       └── data/ticks/            # 👈 PUT YOUR TICK FILES HERE
│           ├── EURUSD_sample.csv  # Sample data (included)
│           ├── GBPUSD_sample.csv  # Sample data (included)
│           └── YOUR_DATA.csv      # Your tick files go here
├── scripts/
│   ├── convert-ticks.js           # Convert any format
│   └── validate-ticks.js          # Validate your files
├── README.md                      # Main documentation
├── HOW_TO_ADD_YOUR_DATA.md       # 👈 READ THIS for data format
├── EXAMPLES.md                    # Real-world conversion examples
├── TICK_DATA_GUIDE.md            # Detailed format guide
└── QUICKSTART.md                  # 5-minute setup guide
```

---

## Common Issues & Solutions

### "No symbols detected"
**Problem:** Watchlist is empty

**Solution:**
1. Check filename starts with 6 letters: `EURUSD_*.csv`
2. File is in `apps/server/data/ticks/`
3. Restart server

### "Timestamps are wrong"
**Problem:** Chart shows dates in 1970 or wrong year

**Solution:**
- Timestamps must be milliseconds (13 digits), not seconds (10 digits)
- Convert: `timestamp_seconds * 1000`
- Verify: `new Date(1700000000000)` should show Nov 2023

### "No bid/ask in my data"
**Problem:** Only have price, not bid/ask

**Solution:**
Use the converter - it adds bid/ask automatically:
```bash
node scripts/convert-ticks.js your_data.csv EURUSD
```

### "File too large"
**Problem:** Server slow or crashes

**Solution:**
Compress with gzip:
```bash
gzip your_file.csv
# Creates your_file.csv.gz (auto-detected)
```

---

## Helpful Commands

```bash
# Start development
npm run dev                    # Start both client & server
npm run dev:server            # Server only
npm run dev:client            # Client only

# Convert your data
npm run convert your_data.csv EURUSD

# Validate your data
npm run validate apps/server/data/ticks/EURUSD_ticks.csv

# Run tests
npm run test

# Build for production
npm run build
```

---

## Documentation Guide

**Start here:**
1. ✅ **START_HERE.md** (you are here)
2. 📖 **HOW_TO_ADD_YOUR_DATA.md** - Simple guide to add your data
3. 📚 **EXAMPLES.md** - Real-world conversion examples

**For more details:**
- **README.md** - Complete feature list and setup
- **TICK_DATA_GUIDE.md** - Detailed format specifications
- **QUICKSTART.md** - 5-minute setup guide
- **DEPLOYMENT.md** - Production deployment
- **CONTRIBUTING.md** - Development guidelines

---

## Next Steps

### 1. Test with Sample Data (Recommended)
```bash
npm run dev
# Open http://localhost:5173
# Click EURUSD or GBPUSD in watchlist
# Try different timeframes
```

### 2. Add Your Own Data
```bash
# Read: HOW_TO_ADD_YOUR_DATA.md
# Convert if needed: npm run convert your_data.csv EURUSD
# Copy to: apps/server/data/ticks/
# Restart: npm run dev
```

### 3. Explore Features
- Switch timeframes (1s, 5s, 1m, 5m, 15m, 1h, 4h, 1D)
- Add indicators (click "Indicators" button)
- Draw trend lines (drawing toolbar)
- Practice trading (order panel on right)
- Adjust replay speed (settings gear icon)

---

## Support

**Having issues?**
1. Check **HOW_TO_ADD_YOUR_DATA.md** for data format
2. Validate your file: `npm run validate your_file.csv`
3. Check server logs for errors
4. Test with sample data first

**Want to customize?**
- See **CONTRIBUTING.md** for development guide
- See **FEATURES.md** for roadmap
- All code is TypeScript with comments

---

## What Makes This Special

✅ **No paid APIs** - Uses your local tick data
✅ **Automatic candlesticks** - Generated on-demand for any timeframe
✅ **Professional charting** - TradingView Lightweight Charts
✅ **Full technical analysis** - Indicators, drawings, multi-timeframe
✅ **Paper trading** - Practice with simulated orders
✅ **Real-time simulation** - WebSocket streaming with replay
✅ **Production ready** - TypeScript, tests, documentation
✅ **Easy to use** - Just add your tick files and go!

---

## 🎉 Ready to Start!

```bash
# 1. Install
npm install

# 2. Start
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Start trading!
```

Your tick data will automatically become beautiful candlesticks on any timeframe you choose. No manual conversion needed!

**Questions?** Read **HOW_TO_ADD_YOUR_DATA.md** for detailed instructions.

**Happy Trading! 📈**
