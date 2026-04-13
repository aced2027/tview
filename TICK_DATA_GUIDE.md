# Tick Data Integration Guide

## Quick Start - Add Your Tick Data

### Step 1: Prepare Your Tick Data

Your tick data should be in one of these formats:

#### CSV Format (Recommended)
```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
1700000001000,1.08451,1.08453,1.08452,150
```

#### JSON Format
```json
[
  {"t": 1700000000000, "b": 1.08450, "a": 1.08452, "l": 1.08451, "v": 100},
  {"t": 1700000001000, "b": 1.08451, "a": 1.08453, "l": 1.08452, "v": 150}
]
```

### Step 2: Name Your Files Correctly

**CRITICAL:** Filename MUST start with a 6-letter currency pair symbol:

✅ **Correct:**
- `EURUSD_ticks_2024.csv`
- `GBPUSD_january.csv`
- `USDJPY_data.json`
- `AUDUSD_ticks.csv.gz`

❌ **Wrong:**
- `ticks_EURUSD.csv` (symbol not at start)
- `EUR_USD.csv` (not 6 letters)
- `data.csv` (no symbol)

### Step 3: Copy Files to Data Directory

```bash
# Copy your tick files
cp your_tick_files/*.csv apps/server/data/ticks/

# Or if compressed
cp your_tick_files/*.csv.gz apps/server/data/ticks/
```

### Step 4: Start the Server

```bash
npm run dev
```

The server will automatically:
1. Detect all symbols from filenames
2. Parse tick data (CSV/JSON/GZIP)
3. Generate candlesticks on-demand for any timeframe
4. Stream ticks via WebSocket

### Step 5: View in Browser

Open http://localhost:5173 and you'll see:
- Your symbols in the watchlist
- Click any symbol to load its chart
- Select timeframe (1s, 5s, 1m, 5m, 15m, 1h, 4h, 1D, etc.)
- Candlesticks are generated automatically!

## Tick Data Requirements

### Timestamp Format
- **Must be Unix milliseconds** (13 digits)
- Example: `1700000000000` (not `1700000000`)
- JavaScript: `Date.now()` or `new Date().getTime()`
- Python: `int(time.time() * 1000)`

### Required Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| timestamp | number | Unix milliseconds | ✅ Yes |
| bid | number | Bid price | ✅ Yes |
| ask | number | Ask price | ✅ Yes |
| last | number | Last traded price | ⚠️ Optional* |
| volume | number | Tick volume | ⚠️ Optional* |

*If `last` is 0 or missing, mid price `(bid + ask) / 2` is used.
*If `volume` is missing, defaults to 0.

### CSV Column Names (Flexible)

The parser accepts multiple column name variations:

| Standard | Alternatives |
|----------|--------------|
| timestamp | t, time |
| bid | b |
| ask | a |
| last | l |
| volume | v |

### File Size Recommendations

- **Small files:** < 10 MB (loads instantly)
- **Medium files:** 10-100 MB (loads in 1-5 seconds)
- **Large files:** > 100 MB (consider splitting or compressing)

For large files, use GZIP compression:
```bash
gzip EURUSD_ticks.csv
# Creates EURUSD_ticks.csv.gz
```

## Converting Your Data

### From Different Timestamp Formats

#### Unix Seconds → Milliseconds
```javascript
// Multiply by 1000
const milliseconds = seconds * 1000;
```

#### ISO String → Milliseconds
```javascript
const milliseconds = new Date('2024-01-15T10:30:00Z').getTime();
```

#### Python Datetime → Milliseconds
```python
import time
from datetime import datetime

dt = datetime(2024, 1, 15, 10, 30, 0)
milliseconds = int(dt.timestamp() * 1000)
```

### From Different Price Formats

If your data has only one price field:
```csv
timestamp,price,volume
1700000000000,1.08451,100
```

Convert to bid/ask:
```javascript
// Add small spread (e.g., 0.00002 for forex)
const spread = 0.00002;
const bid = price - spread / 2;
const ask = price + spread / 2;
```

## Example Conversion Scripts

### Python: Convert Your Data to CSV

```python
import pandas as pd

# Read your data (adjust to your format)
df = pd.read_csv('your_data.csv')

# Convert timestamp to milliseconds if needed
if df['timestamp'].max() < 10000000000:  # Likely seconds
    df['timestamp'] = df['timestamp'] * 1000

# Ensure required columns exist
if 'bid' not in df.columns and 'price' in df.columns:
    spread = 0.00002
    df['bid'] = df['price'] - spread / 2
    df['ask'] = df['price'] + spread / 2
    df['last'] = df['price']

if 'volume' not in df.columns:
    df['volume'] = 100  # Default volume

# Select and order columns
output = df[['timestamp', 'bid', 'ask', 'last', 'volume']]

# Save with correct naming
symbol = 'EURUSD'  # Change to your symbol
output.to_csv(f'apps/server/data/ticks/{symbol}_ticks.csv', index=False)
print(f"✅ Created {symbol}_ticks.csv with {len(output)} ticks")
```

### Node.js: Convert Your Data

```javascript
const fs = require('fs');

// Read your data
const yourData = JSON.parse(fs.readFileSync('your_data.json'));

// Convert to required format
const ticks = yourData.map(item => ({
  timestamp: item.time * 1000, // Convert seconds to ms if needed
  bid: item.bid || item.price - 0.00001,
  ask: item.ask || item.price + 0.00001,
  last: item.last || item.price,
  volume: item.volume || 100
}));

// Save as CSV
const csv = [
  'timestamp,bid,ask,last,volume',
  ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
].join('\n');

const symbol = 'EURUSD'; // Change to your symbol
fs.writeFileSync(`apps/server/data/ticks/${symbol}_ticks.csv`, csv);
console.log(`✅ Created ${symbol}_ticks.csv with ${ticks.length} ticks`);
```

## Verifying Your Data

### Check File Format
```bash
# View first few lines
head -n 5 apps/server/data/ticks/EURUSD_ticks.csv

# Should show:
# timestamp,bid,ask,last,volume
# 1700000000000,1.08450,1.08452,1.08451,100
# ...
```

### Check Symbol Detection
```bash
# Start server and check logs
npm run dev:server

# Should see:
# Server running on port 3001
# Detected symbols: EURUSD, GBPUSD, USDJPY
```

### Test API Endpoint
```bash
# Get available symbols
curl http://localhost:3001/api/symbols

# Should return:
# {"symbols":["EURUSD","GBPUSD","USDJPY"]}

# Get candles
curl "http://localhost:3001/api/candles/EURUSD?tf=5m"

# Should return candlestick data
```

## Candlestick Generation

Candlesticks are generated automatically from your tick data:

### How It Works

1. **You provide:** Raw tick data (timestamp, bid, ask, last, volume)
2. **Server aggregates:** Groups ticks into time buckets (1s, 5s, 1m, 5m, etc.)
3. **Creates OHLCV:** 
   - Open: First tick price in period
   - High: Highest tick price in period
   - Low: Lowest tick price in period
   - Close: Last tick price in period
   - Volume: Sum of all tick volumes in period

### Supported Timeframes

All timeframes are generated on-demand:
- **Seconds:** 1s, 5s, 10s, 30s
- **Minutes:** 1m, 3m, 5m, 15m, 30m
- **Hours:** 1h, 2h, 4h, 6h, 12h
- **Days:** 1D
- **Weeks:** 1W
- **Months:** 1M

### Example: 5-Minute Candles

If you have ticks at:
```
10:00:00 - bid: 1.0840, ask: 1.0842
10:01:30 - bid: 1.0845, ask: 1.0847
10:03:00 - bid: 1.0843, ask: 1.0845
10:04:30 - bid: 1.0848, ask: 1.0850
```

The 5-minute candle (10:00-10:05) will be:
```
Open: 1.0841 (mid of first tick)
High: 1.0849 (highest mid price)
Low: 1.0841 (lowest mid price)
Close: 1.0849 (mid of last tick)
Volume: sum of all volumes
```

## Troubleshooting

### Symbol Not Detected

**Problem:** Symbol doesn't appear in watchlist

**Solutions:**
1. Check filename starts with 6-letter symbol: `EURUSD_*.csv`
2. Ensure file is in `apps/server/data/ticks/`
3. Restart server: `npm run dev:server`
4. Check server logs for errors

### No Candles Generated

**Problem:** Chart shows "No data" or empty

**Solutions:**
1. Verify timestamp format (must be milliseconds)
2. Check CSV has header row
3. Ensure bid/ask columns exist
4. Test with sample data first

### Timestamps Wrong

**Problem:** Chart shows dates in wrong year/time

**Solutions:**
1. Timestamps must be Unix milliseconds (13 digits)
2. Convert seconds to milliseconds: `timestamp * 1000`
3. Verify: `new Date(1700000000000)` should show Nov 2023

### File Too Large

**Problem:** Server slow or crashes

**Solutions:**
1. Compress with gzip: `gzip your_file.csv`
2. Split into multiple files by date
3. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev:server`

## Advanced: Multiple Symbols

To add multiple currency pairs:

```bash
apps/server/data/ticks/
├── EURUSD_2024_jan.csv
├── EURUSD_2024_feb.csv
├── GBPUSD_2024_jan.csv
├── USDJPY_2024_jan.csv
└── AUDUSD_2024_jan.csv
```

All files for the same symbol are automatically merged and sorted by timestamp.

## Need Help?

1. Check sample files: `apps/server/data/ticks/EURUSD_sample.csv`
2. Review server logs for parsing errors
3. Test with small dataset first (100-1000 ticks)
4. Verify data format matches examples above

## Summary Checklist

- [ ] Tick data in CSV or JSON format
- [ ] Timestamps in Unix milliseconds (13 digits)
- [ ] Filename starts with 6-letter symbol (e.g., EURUSD_*.csv)
- [ ] File copied to `apps/server/data/ticks/`
- [ ] Server started: `npm run dev`
- [ ] Symbol appears in watchlist
- [ ] Chart loads with candlesticks
- [ ] Can switch between timeframes

Once complete, your tick data will automatically generate candlesticks for all timeframes! 🎉
