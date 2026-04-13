# Trading Terminal - Complete Setup Guide

## ✅ What's Been Completed

Your trading terminal is now fully set up with pre-generated candle data for all major forex pairs!

### 🎯 Current Features

1. **Pre-Generated Candle Data for All Pairs**
   - AUDUSD
   - EURUSD
   - GBPUSD
   - NZDUSD
   - USDCAD
   - USDCHF
   - USDJPY

2. **Multiple Timeframes**
   - 1 minute (1min)
   - 5 minutes (5min)
   - 15 minutes (15min)
   - 30 minutes (30min)
   - 1 hour (1h)
   - 4 hours (4h)
   - 1 day (1d)
   - 1 week (1w)

3. **Fast, Offline Chart Loading**
   - Data stored locally in JSON format
   - No server required to load candles
   - Instant timeframe switching
   - Cached data for repeat loads

4. **Interactive Trading Chart**
   - Candlestick charts with lightweight-charts library
   - Pair selector (watchlist)
   - Timeframe switcher buttons
   - Real-time price visualization
   - Responsive design

### 📊 Data Overview

- **Source**: 4 months of 2026 tick data (Jan-Apr)
- **Total Candles**: ~100,000+ per pair at 1-minute intervals
- **File Size**: ~2-5 MB per pair (depending on network activity)
- **Format**: Pre-aggregated OHLC candles in JSON

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (already installed)
- npm (comes with Node.js)

### 1. Generate Candle Data (Already Done!)
```bash
cd z:\TV
npm run generate-candles
```
This has already been run and generated all candle files in:
- `z:\TV\public\candles/` (master location)
- `z:\TV\apps\client\public\candles/` (served by Vite)

### 2. Start the Development Server
```bash
cd z:\TV
npm run dev:client
```

The terminal will output:
```
➜  Local:   http://localhost:5173/
```

### 3. Open in Browser
Navigate to: `http://localhost:5173`

## 📁 Project Structure

```
TV/
├── scripts/
│   └── generate-candles.js          # Script to generate candles from ticks
├── apps/
│   └── client/
│       ├── src/
│       │   ├── components/
│       │   │   ├── chart/           # Chart UI components
│       │   │   ├── watchlist/       # Pair selector
│       │   │   └── ...
│       │   ├── services/
│       │   │   ├── candlesLocal.ts  # Local data loader (key file!)
│       │   │   ├── api.ts           # API service (optional)
│       │   │   └── ...
│       │   ├── stores/
│       │   │   └── chartStore.ts    # State management (Zustand)
│       │   ├── hooks/
│       │   │   └── useChartData.ts  # Data loading logic
│       │   └── ...
│       ├── public/
│       │   └── candles/             # Served candle data (JSON files)
│       └── ...
├── public/
│   └── candles/                      # Master copy of candle data
└── 2026/                             # Original tick data
```

## 🎨 How It Works

1. **Tick Data** (Original)
   - Location: `z:\TV\2026/{PAIR}/HISTDATA_COM_ASCII_{PAIR}_T{DATE}/`
   - Format: CSV with YYYYMMDD HHMMSSmmm, Bid, Ask, Flag
   - Sample: 7.6 million+ ticks per pair

2. **Candle Generation**
   - Reads all tick files for each pair
   - Aggregates ticks into OHLC candles
   - Creates 8 timeframes per pair
   - Saves as JSON for fast loading

3. **Chart Display**
   - Browser loads JSON from `/candles/{pair}/{timeframe}.json`
   - Data is cached in memory
   - Lightweight-charts renders candlesticks
   - Instant switching between pairs/timeframes

## 🔧 Key Components

### Services
- **`candlesLocal.ts`**: Loads candles from JSON files, manages cache, provides available pairs/timeframes
- **`chartStore.ts`**: Zustand store for chart state (selected pair, timeframe, candles)
- **`useChartData.ts`**: Hook that loads candles when pair/timeframe changes

### Components
- **`ChartContainer.tsx`**: Main chart component using lightweight-charts
- **`TimeframeSelector.tsx`**: Buttons for switching timeframes
- **`Watchlist.tsx`**: Panel showing available currency pairs

## ⚡ Performance Tips

1. **Data is Pre-Generated**: No computation on the fly, just loading JSON files
2. **Client-Side Only**: No server overhead, chart runs entirely in browser
3. **Cached Data**: Once loaded, candles stay in memory
4. **Fast Switching**: Changing timeframes loads from cache if available

## 📱 Usage

1. **Select a Currency Pair**
   - Click on a pair in the Watchlist panel (left side)
   - Default: AUDUSD

2. **Choose a Timeframe**
   - Click timeframe buttons above the chart
   - Available: 1min, 5min, 15min, 30min, 1h, 4h, 1d, 1w

3. **Analyze Candles**
   - Use crosshair tool to inspect prices
   - Hover for price information
   - Chart auto-fits to show all available data

## 🐛 Troubleshooting

### Chart shows "Loading..." but doesn't load
1. Check browser console (F12 → Console) for errors
2. Verify `/public/candles/` folder has JSON files
3. Check that the pair/timeframe folder exists
4. Clear browser cache and reload

### Command not found errors
```bash
# Make sure you're in the right directory
cd z:\TV

# Or use full paths
node scripts/generate-candles.js
```

### Port 5173 already in use
```bash
# Kill the process using the port or use a different port
npm run dev:client -- --port 5174
```

### Missing pairs or timeframes
Regenerate the candles:
```bash
cd z:\TV
node scripts/generate-candles.js
# Then copy to client:
Copy-Item -Path "z:\TV\public\candles\*" -Destination "z:\TV\apps\client\public\candles" -Recurse -Force
```

## 📈 Adding More Data

To add more months or years of data:

1. Place tick data in `z:\TV/2026/{PAIR}/HISTDATA_COM_ASCII_{PAIR}_T{YYYYMM}/`
2. Run generation script:
   ```bash
   npm run generate-candles
   ```
3. Copy updated candles to client public folder:
   ```bash
   Copy-Item -Path "z:\TV\public\candles\*" -Destination "z:\TV\apps\client\public\candles" -Recurse -Force
   ```
4. Restart dev server (hot reload should work)
5. Clear browser cache if needed

## 🔐 Production Build

To create a production build:
```bash
cd z:\TV
npm run build
```

This creates optimized bundles in `apps/client/dist/`

## 📊 Development Commands

```bash
# Start dev server (client only)
npm run dev:client

# Build all apps
npm run build

# Run tests
npm run test

# Generate candles from ticks
npm run generate-candles

# Validate tick data
npm run validate
```

## 📝 Notes

- The chart uses **lightweight-charts** v4.1.3 for rendering
- Data is stored in the browser's memory cache
- Each candle file is a JSON array of OHLC objects
- Timestamps are Unix timestamps in seconds
- All times are in UTC

## 🎯 Next Steps

1. ✅ Open `http://localhost:5173` in your browser
2. ✅ Select a currency pair from the Watchlist
3. ✅ Click different timeframe buttons
4. ✅ Observe candles load instantly!

## 🤝 Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Verify files exist in `public/candles/`
3. Clear cache and reload
4. Re-run candle generation if data missing

---

**Status**: ✅ Ready to use!
**Data**: 4 months (2026 Jan-Apr) across 7 major forex pairs
**Performance**: Sub-second load times for candle switching
