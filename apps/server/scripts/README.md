# 🚀 Interactive Tick Data Downloader

## Quick Start

```bash
cd apps/server/scripts
python download_month_by_month.py
```

## Features

✨ **Interactive Menu System**
- Select pairs from 12 major forex pairs
- Choose year (2010-2024)
- Pick start and end months
- Confirmation summary before download

📊 **Progress Tracking**
- Real-time progress bar
- Download counter (e.g., [3/48])
- File size display
- Success/failure summary

🎨 **Beautiful UI**
- Color-coded output
- Clear visual hierarchy
- Professional formatting

## Usage Examples

### Download All Pairs for 2024
1. Run: `python download_month_by_month.py`
2. Select: `A` (All pairs)
3. Year: `1` (2024)
4. Start month: `1` (January)
5. End month: `12` (December)
6. Confirm: `Y`

### Download Specific Pairs
1. Run: `python download_month_by_month.py`
2. Select: `1,2,3` (AUDUSD, GBPUSD, USDJPY)
3. Year: `1` (2024)
4. Start month: `1`
5. End month: `3` (Jan-Mar only)
6. Confirm: `Y`

### Download Single Pair, Single Month
1. Run: `python download_month_by_month.py`
2. Select: `1` (AUDUSD)
3. Year: `2024`
4. Start month: `12`
5. End month: `12`
6. Confirm: `Y`

## Available Pairs

1. AUDUSD - Australian Dollar / US Dollar
2. GBPUSD - British Pound / US Dollar
3. USDJPY - US Dollar / Japanese Yen
4. USDCHF - US Dollar / Swiss Franc
5. EURUSD - Euro / US Dollar
6. USDCAD - US Dollar / Canadian Dollar
7. EURGBP - Euro / British Pound
8. EURJPY - Euro / Japanese Yen
9. NZDUSD - New Zealand Dollar / US Dollar
10. GBPJPY - British Pound / Japanese Yen
11. EURCHF - Euro / Swiss Franc
12. AUDJPY - Australian Dollar / Japanese Yen

## Output Format

Files are saved as: `SYMBOL_TICKS_YYYY_MM.CSV`

Example:
- `AUDUSD_TICKS_2024_01.CSV`
- `GBPUSD_TICKS_2024_12.CSV`

## Requirements

- Python 3.6+
- dukascopy-node installed globally:
  ```bash
  npm install -g dukascopy-node
  ```

## Download Speed

- Single month: ~30 seconds
- Full year (12 months): ~6-10 minutes
- All 12 pairs (2024): ~2-3 hours

## Troubleshooting

### Error: dukascopy-node not found
```bash
npm install -g dukascopy-node
```

### Error: Permission denied
Run terminal as Administrator (Windows) or use sudo (Mac/Linux)

### Downloads failing
- Check internet connection
- Reduce batch size in script (change `--batch-size 20` to `--batch-size 10`)
- Increase retries (change `--retries 5` to `--retries 10`)

## Advanced Usage

### Edit Default Settings

Open `download_month_by_month.py` and modify:

```python
# Line ~100: Batch size (default: 20)
"--batch-size", "20",

# Line ~101: Retries (default: 5)
"--retries", "5",
```

### Add More Pairs

Edit the `PAIRS` list at the top of the script:

```python
PAIRS = [
    "AUDUSD", "GBPUSD", "USDJPY", "USDCHF",
    "EURUSD", "USDCAD", "EURGBP", "EURJPY",
    "NZDUSD", "GBPJPY", "EURCHF", "AUDJPY",
    "XAUUSD",  # Add Gold
    "BTCUSD",  # Add Bitcoin
]
```

## Data Source

All data from [Dukascopy](https://www.dukascopy.com/) - Swiss forex bank providing free historical tick data since 2003.
