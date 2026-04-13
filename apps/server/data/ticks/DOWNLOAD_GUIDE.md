# 🚀 Fast Tick Data Download Guide

## Quick Start (Recommended)

### Option 1: Download All 4 Pairs for 2024
```powershell
cd Z:\TV\apps\server\data\ticks
.\download_ticks.ps1
```

### Option 2: Download Specific Pairs
```powershell
# Just AUDUSD and GBPUSD
.\download_ticks.ps1 -Symbols @("audusd", "gbpusd")

# Just AUDUSD
.\download_ticks.ps1 -Symbols @("audusd")
```

### Option 3: Download Specific Months
```powershell
# January to March 2024
.\download_ticks.ps1 -StartMonth 1 -EndMonth 3

# Just December 2024
.\download_ticks.ps1 -StartMonth 12 -EndMonth 12
```

### Option 4: Download Multiple Years
```powershell
# 2023 full year
.\download_ticks.ps1 -Year 2023

# 2020-2024 (run for each year)
.\download_ticks.ps1 -Year 2020
.\download_ticks.ps1 -Year 2021
.\download_ticks.ps1 -Year 2022
.\download_ticks.ps1 -Year 2023
.\download_ticks.ps1 -Year 2024
```

## Manual Commands (Advanced)

### Single Month Download
```powershell
dukascopy-node -i audusd -from 2024-01-01 -to 2024-01-31 -t tick -f csv --cache --batch-size 20 --retries 5
```

### Full Year Download
```powershell
dukascopy-node -i audusd -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 20 --retries 5
```

### Parallel Downloads (All 4 Pairs at Once)
```powershell
Start-Job -ScriptBlock { dukascopy-node -i audusd -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 20 }
Start-Job -ScriptBlock { dukascopy-node -i gbpusd -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 20 }
Start-Job -ScriptBlock { dukascopy-node -i usdjpy -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 20 }
Start-Job -ScriptBlock { dukascopy-node -i usdchf -from 2024-01-01 -to 2024-12-31 -t tick -f csv --cache --batch-size 20 }

# Check progress
Get-Job | Receive-Job -Keep

# Wait for all to complete
Get-Job | Wait-Job
```

## Available Symbols

### Major Forex Pairs
- `audusd` - Australian Dollar / US Dollar
- `eurusd` - Euro / US Dollar
- `gbpusd` - British Pound / US Dollar
- `usdjpy` - US Dollar / Japanese Yen
- `usdchf` - US Dollar / Swiss Franc
- `usdcad` - US Dollar / Canadian Dollar
- `nzdusd` - New Zealand Dollar / US Dollar

### Cross Pairs
- `eurjpy` - Euro / Japanese Yen
- `gbpjpy` - British Pound / Japanese Yen
- `eurgbp` - Euro / British Pound
- `audjpy` - Australian Dollar / Japanese Yen

### Commodities
- `xauusd` - Gold / US Dollar
- `xagusd` - Silver / US Dollar
- `wtiusd` - WTI Crude Oil / US Dollar

### Crypto (from 2017)
- `btcusd` - Bitcoin / US Dollar
- `ethusd` - Ethereum / US Dollar

## Data Availability

- **Forex:** 2003 - Present (21+ years)
- **Commodities:** 2011 - Present
- **Crypto:** 2017 - Present

## Download Speed

- **Single month:** ~30 seconds
- **Full year (12 months):** ~6-10 minutes
- **All 4 pairs (2024):** ~30-40 minutes
- **5 years (2020-2024):** ~2-3 hours per pair

## Optimal Settings

- **Batch Size:** 20 (safe, won't get rate-limited)
- **Retries:** 5 (handles temporary failures)
- **Cache:** Always use `--cache` for faster re-runs

## Troubleshooting

### Error: dukascopy-node not found
```powershell
npm install -g dukascopy-node
```

### Error: Instrument not found
Use lowercase: `audusd` not `AUDUSD`

### Download stuck or slow
- Reduce batch size: `--batch-size 10`
- Increase retries: `--retries 10`
- Check internet connection

### Files not renamed
The script auto-renames from:
- `audusd-2024-01-01-2024-01-31-tick.csv`

To:
- `AUDUSD_TICKS_2024_01.CSV`

If manual download, rename yourself:
```powershell
Rename-Item "audusd-2024-01-01-2024-01-31-tick.csv" "AUDUSD_TICKS_2024_01.CSV"
```

## File Format

Output files are CSV with this format:
```csv
timestamp,bid,ask,last,volume
1704126841115,0.68043,0.68184,0.68114,100
1704126845027,0.68061,0.68184,0.68122,100
```

- `timestamp`: Unix milliseconds
- `bid`: Bid price
- `ask`: Ask price
- `last`: Last traded price
- `volume`: Tick volume

## Data Source

All data from [Dukascopy](https://www.dukascopy.com/) - Swiss forex bank providing free historical tick data.
