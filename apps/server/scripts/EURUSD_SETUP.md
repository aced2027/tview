# EURUSD Data Setup Guide

## Quick Start (One Command)

```bash
cd Z:\TV\apps\server\scripts
python setup_eurusd_data.py
```

This single script will:
1. ✅ Download EURUSD tick data (Jan-Apr 2024) from Histdata.com
2. ✅ Convert to your server's format
3. ✅ Make it ready for the chart

## What You'll Get

After running the script, you'll have these files:

```
apps/server/data/ticks/
├── EURUSD_TICKS_2024_01.csv  (~50-100 MB)
├── EURUSD_TICKS_2024_02.csv  (~50-100 MB)
├── EURUSD_TICKS_2024_03.csv  (~50-100 MB)
└── EURUSD_TICKS_2024_04.csv  (~50-100 MB)
```

Format:
```csv
timestamp,bid,ask,last,volume
1704067200123,1.10234,1.10245,1.10239,100
```

## View on Chart

1. Start your server:
   ```bash
   cd Z:\TV
   npm run dev
   ```

2. Open http://localhost:5173

3. Add EURUSD to watchlist (if not already there)

4. Click on EURUSD - the chart will display candlesticks!

## How It Works

### Data Flow

```
Histdata.com
    ↓ (download_histdata.py)
DAT_ASCII_EURUSD_T_202401.csv
    ↓ (convert_histdata_to_server_format.py)
EURUSD_TICKS_2024_01.csv
    ↓ (tickLoader.ts)
Server API: /api/ticks/EURUSD
    ↓ (candleAggregator.ts)
Candlestick data
    ↓ (ChartContainer.tsx)
Live chart display!
```

### Your Existing System

Your app already has:
- ✅ Tick loader (`apps/server/src/services/tickLoader.ts`)
- ✅ Candle aggregator (`apps/client/src/utils/candleAggregator.ts`)
- ✅ Chart component (`apps/client/src/components/chart/ChartContainer.tsx`)
- ✅ API endpoint (`/api/ticks/:symbol`)

All you need is the data in the right format!

## Manual Steps (If Needed)

### 1. Download Only
```bash
python download_histdata.py
```

### 2. Convert Only
```bash
python convert_histdata_to_server_format.py
```

### 3. Check What You Have
```bash
cd Z:\TV\apps\server\data\ticks
dir *.csv
```

## Troubleshooting

### No data showing on chart?

1. Check files exist:
   ```bash
   dir Z:\TV\apps\server\data\ticks\EURUSD*.csv
   ```

2. Check server logs for errors

3. Verify EURUSD is in watchlist

4. Try refreshing the page

### Download fails?

- Check internet connection
- Histdata.com might be rate-limiting
- Wait a few minutes and retry
- Try downloading one month at a time

### Conversion fails?

- Check input files exist
- Verify CSV format is correct
- Look for error messages in output

## Customize

Want different pairs or dates? Edit `download_histdata.py`:

```python
PAIRS = ["EURUSD", "GBPUSD", "USDJPY"]  # Add more pairs
START_YEAR = 2024
END_YEAR = 2024
START_MONTH = 1
END_MONTH = 12  # Full year
```

## Note About 2026 Data

Histdata.com only has historical data up to recent months. Since we're in April 2026, the latest complete data available is likely from 2024 or early 2025. That's why the script is configured for 2024 data.

For live/current data, you would need:
- A real-time data provider (Polygon.io, Alpha Vantage, etc.)
- WebSocket connection for live ticks
- Different data source than Histdata

## Next Steps

After you have EURUSD data working:

1. Add more pairs (edit `PAIRS` in download script)
2. Implement bar replay feature (see `.kiro/specs/bar-replay-platform/`)
3. Add indicators and drawing tools
4. Set up real-time data feed for current prices
