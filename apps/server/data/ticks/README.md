# Tick Data Directory

This directory contains historical tick data for forex pairs.

## Quick Download (Recommended - Histdata.com)

### Download from Histdata.com (Best Option)
```bash
cd apps/server/scripts
python download_histdata.py
```

This script:
- Downloads from Histdata.com (reliable, free source)
- Supports 23 major forex pairs
- Configurable year and month ranges
- Auto-extracts CSV files
- Skips already downloaded files
- Default: AUDUSD, GBPUSD, USDJPY, USDCHF for Jan-Mar 2024

Edit the config at the top of the file to customize:
- `PAIRS` - which pairs to download
- `START_YEAR` / `END_YEAR` - year range
- `START_MONTH` / `END_MONTH` - month range

## Alternative: Dukascopy Direct Download

## Alternative: Dukascopy Direct Download

### Option 1: Download All Pairs for 2024
```bash
cd apps/server
npm run download:install  # Install dukascopy-node (first time only)
npm run download:all      # Download AUDUSD, GBPUSD, USDJPY, USDCHF
```

### Option 2: Download Specific Pair
```bash
cd apps/server
npm run download:audusd   # Download AUDUSD 2024
npm run download:gbpusd   # Download GBPUSD 2024
npm run download:usdjpy   # Download USDJPY 2024
npm run download:usdchf   # Download USDCHF 2024
```

### Option 3: Custom Download
```bash
cd apps/server
node scripts/download-ticks.js EURUSD 2024 --months=1,2,3  # Specific months
node scripts/download-ticks.js XAUUSD 2023                 # Different year
```

## Manual Download (Advanced)

If you prefer manual control:

```bash
# Install dukascopy-node globally
npm install -g dukascopy-node

# Download single month
dukascopy-node -i AUDUSD -from 2024-01-01 -to 2024-01-31 -t tick -f csv --cache --batch-size 30

# Download full year (fast)
dukascopy-node -i AUDUSD -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 30 --retries 5
```

## File Format

Files should be named: `SYMBOL_TICKS_YYYY_MM.CSV`

Example:
- `AUDUSD_TICKS_2024_01.CSV`
- `GBPUSD_TICKS_2024_12.CSV`

CSV format:
```csv
timestamp,bid,ask,last,volume
1704126841115,0.68043,0.68184,0.68114,100
1704126845027,0.68061,0.68184,0.68122,100
```

## Supported Symbols

- AUDUSD - Australian Dollar / US Dollar
- GBPUSD - British Pound / US Dollar  
- USDJPY - US Dollar / Japanese Yen
- USDCHF - US Dollar / Swiss Franc
- EURUSD - Euro / US Dollar
- And many more from Dukascopy

## Download Speed

- **Fast**: ~30 seconds per month with `--batch-size 30`
- **Full year**: ~6-10 minutes per symbol
- **All 4 pairs**: ~30-40 minutes for full 2024 data

## Troubleshooting

**Error: dukascopy-node not found**
```bash
npm install -g dukascopy-node
```

**Error: Permission denied**
```bash
# On Windows, run terminal as Administrator
# On Mac/Linux:
sudo npm install -g dukascopy-node
```

**Download fails or times out**
- Increase retries: `--retries 10`
- Reduce batch size: `--batch-size 10`
- Check internet connection

## Data Source

All data is downloaded from [Dukascopy](https://www.dukascopy.com/), a Swiss forex bank that provides free historical tick data.
