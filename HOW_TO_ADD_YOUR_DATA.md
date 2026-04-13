# How to Add Your Tick Data - Simple Guide

## 🚀 Quick 3-Step Process

### Step 1: Prepare Your File

Your tick data needs these columns:
- **timestamp** (Unix milliseconds - 13 digits like 1700000000000)
- **bid** (bid price)
- **ask** (ask price)
- **last** (last price - optional)
- **volume** (tick volume - optional)

Example CSV:
```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
1700000001000,1.08451,1.08453,1.08452,150
1700000002000,1.08449,1.08451,1.08450,120
```

### Step 2: Name Your File Correctly

**MUST start with 6-letter currency pair:**

✅ `EURUSD_myticks.csv`
✅ `GBPUSD_2024.csv`
✅ `USDJPY_data.csv`

❌ `myticks_EURUSD.csv` (wrong - symbol not first)
❌ `data.csv` (wrong - no symbol)

### Step 3: Copy to Data Folder

```bash
# Copy your file
cp your_tick_file.csv apps/server/data/ticks/

# Start the app
npm run dev

# Open browser
# http://localhost:5173
```

That's it! Your symbol will appear in the watchlist and candlesticks will be generated automatically for all timeframes.

---

## 📝 Detailed Instructions

### If Your Data Has Different Format

#### Only Have Price (No Bid/Ask)?

If your CSV looks like:
```csv
timestamp,price,volume
1700000000000,1.08451,100
```

Add bid/ask by creating a small spread:
```javascript
const spread = 0.00002; // 0.2 pips for forex
bid = price - spread / 2;
ask = price + spread / 2;
```

Use the conversion script:
```bash
node scripts/convert-ticks.js your_data.csv EURUSD
```

#### Timestamps in Seconds?

If your timestamps are 10 digits (seconds), multiply by 1000:
```javascript
timestamp_ms = timestamp_seconds * 1000
```

#### Different Column Names?

The system accepts these variations:
- timestamp → t, time, date
- bid → b
- ask → a
- last → l, price, close
- volume → v, vol

### Using the Conversion Script

If your data needs conversion:

```bash
# Convert any format to the correct format
node scripts/convert-ticks.js input.csv EURUSD

# This will:
# 1. Read your file
# 2. Auto-detect columns
# 3. Convert timestamps if needed
# 4. Add bid/ask if missing
# 5. Save to apps/server/data/ticks/EURUSD_ticks.csv
```

### Validate Your Data

Before starting the server, validate your file:

```bash
node scripts/validate-ticks.js apps/server/data/ticks/EURUSD_ticks.csv

# This checks:
# ✓ Filename format
# ✓ Required columns
# ✓ Data validity
# ✓ Timestamp format
# ✓ Date range
```

---

## 🎯 Real Examples

### Example 1: MetaTrader Export

If you exported from MetaTrader:
```csv
Date,Time,Bid,Ask,Volume
2024-01-15,10:30:00,1.08450,1.08452,100
```

Convert to Unix milliseconds and combine date/time:
```python
import pandas as pd

df = pd.read_csv('mt_export.csv')
df['timestamp'] = pd.to_datetime(df['Date'] + ' ' + df['Time']).astype(int) // 10**6
df['bid'] = df['Bid']
df['ask'] = df['Ask']
df['last'] = (df['Bid'] + df['Ask']) / 2
df['volume'] = df['Volume']

df[['timestamp', 'bid', 'ask', 'last', 'volume']].to_csv('apps/server/data/ticks/EURUSD_ticks.csv', index=False)
```

### Example 2: Simple Price Data

If you only have timestamps and prices:
```csv
time,price
1700000000000,1.08451
1700000001000,1.08452
```

Use the converter:
```bash
node scripts/convert-ticks.js simple_data.csv EURUSD
```

It will automatically add bid/ask with a 0.2 pip spread.

### Example 3: JSON Data

If your data is in JSON:
```json
[
  {"timestamp": 1700000000000, "bid": 1.08450, "ask": 1.08452},
  {"timestamp": 1700000001000, "bid": 1.08451, "ask": 1.08453}
]
```

Just name it correctly and copy:
```bash
cp your_data.json apps/server/data/ticks/EURUSD_data.json
```

---

## 🔧 Troubleshooting

### "No symbols detected"

**Problem:** Watchlist is empty

**Fix:**
1. Check filename: Must start with 6 letters (EURUSD, GBPUSD, etc.)
2. Check location: File must be in `apps/server/data/ticks/`
3. Restart server

### "No data for symbol"

**Problem:** Chart shows error

**Fix:**
1. Validate file: `node scripts/validate-ticks.js your_file.csv`
2. Check timestamps are milliseconds (13 digits)
3. Check CSV has header row
4. Ensure bid/ask columns exist

### "Chart shows wrong dates"

**Problem:** Dates are in 1970 or wrong year

**Fix:**
- Timestamps must be milliseconds, not seconds
- Multiply by 1000: `timestamp * 1000`
- Verify: `new Date(1700000000000)` should show Nov 2023

### "Server crashes with large file"

**Problem:** Out of memory

**Fix:**
1. Compress file: `gzip your_file.csv`
2. Split into smaller files by date
3. Increase memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev`

---

## 📊 What Happens Next?

Once your tick data is loaded:

1. **Server detects symbol** from filename
2. **Ticks are parsed** from CSV/JSON
3. **Candlesticks generated** on-demand for any timeframe:
   - 1s, 5s, 10s, 30s
   - 1m, 3m, 5m, 15m, 30m
   - 1h, 2h, 4h, 6h, 12h
   - 1D, 1W, 1M

4. **WebSocket streams** ticks in real-time simulation
5. **Chart displays** with full technical analysis

All automatic - no configuration needed!

---

## 💡 Tips

1. **Start small:** Test with 1000-10000 ticks first
2. **Use compression:** GZIP files load faster
3. **Multiple files:** Can have multiple files per symbol (auto-merged)
4. **Multiple symbols:** Add as many pairs as you want
5. **Backup originals:** Keep your original data files safe

---

## ✅ Checklist

Before starting:
- [ ] Tick data in CSV or JSON format
- [ ] Timestamps in Unix milliseconds (13 digits)
- [ ] Filename starts with 6-letter symbol
- [ ] File in `apps/server/data/ticks/` folder
- [ ] Validated with `validate-ticks.js` (optional)

After starting:
- [ ] Server shows "Detected symbols: EURUSD, ..."
- [ ] Symbol appears in watchlist
- [ ] Click symbol loads chart
- [ ] Can switch timeframes
- [ ] Candlesticks display correctly

---

## 🆘 Need Help?

1. **Validate your file:**
   ```bash
   node scripts/validate-ticks.js your_file.csv
   ```

2. **Check sample files:**
   ```bash
   cat apps/server/data/ticks/EURUSD_sample.csv
   ```

3. **Test with sample data first:**
   The app includes working sample files - make sure those work before adding your data.

4. **Check server logs:**
   Look for parsing errors when server starts.

---

## 🎉 Success!

Once your data is loaded, you can:
- View candlesticks on any timeframe
- Add technical indicators (SMA, EMA, RSI, MACD, BB)
- Draw trend lines and analysis tools
- Practice paper trading
- Analyze historical patterns

The candlesticks are generated automatically from your tick data - no manual conversion needed!
