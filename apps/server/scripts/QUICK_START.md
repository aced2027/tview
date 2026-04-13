# Quick Start: Download Tick Data

## The Problem
Your `.bi5` files are all 0 bytes - the dukascopy-node downloads failed silently.

## The Solution
Use the new Python script that downloads directly from Dukascopy's API.

## Steps

### 1. Install Python (if needed)
```bash
python --version
```

If not installed, download from: https://www.python.org/downloads/

### 2. Install Required Package
```bash
pip install requests
```

### 3. Run the Downloader
```bash
cd Z:\TV\apps\server\scripts
python download_dukascopy_direct.py
```

### 4. What It Does
- Downloads tick data directly from Dukascopy's HTTP API
- Converts .bi5 binary format to CSV automatically
- No external tools needed - pure Python
- Downloads AUDUSD, GBPUSD, USDJPY, USDCHF for Jan-Mar 2024

### 5. Customize (Optional)
Edit `download_dukascopy_direct.py` to change:
- `PAIRS` - which currency pairs to download
- `YEAR` - which year (use 2024 or earlier, NOT 2026!)
- `MONTHS` - which months (e.g., `[1, 2, 3]` for Jan-Mar)

### 6. After Download
Restart your development server:
```bash
cd Z:\TV
npm run dev
```

## Expected Output
```
AUDUSD_TICKS_2024_01.csv  (~50-100 MB)
AUDUSD_TICKS_2024_02.csv  (~50-100 MB)
AUDUSD_TICKS_2024_03.csv  (~50-100 MB)
... (same for GBPUSD, USDJPY, USDCHF)
```

## Troubleshooting

**Error: requests module not found**
```bash
pip install requests
```

**Error: Permission denied**
Run terminal as Administrator (Windows)

**Download fails / timeout**
- Check internet connection
- Try fewer months at a time
- Dukascopy might be rate-limiting - wait a few minutes

**Still getting 0 KB files**
- Make sure you're using 2024 data, not 2026
- Check that OUTPUT_DIR path is correct
- Verify you have write permissions to the directory

## Why This Works Better
1. Direct HTTP download - no CLI tool issues
2. Automatic conversion - no separate conversion step
3. Pure Python - no global npm installs
4. Clear progress - see exactly what's happening
5. Reliable - handles errors gracefully
