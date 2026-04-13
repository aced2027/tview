# Real-World Examples - Adding Your Tick Data

## Example 1: MetaTrader 5 Export

### Your Data Format
```csv
Date,Time,Bid,Ask,Last,Volume
2024-01-15,10:30:00.123,1.08450,1.08452,1.08451,100
2024-01-15,10:30:01.456,1.08451,1.08453,1.08452,150
```

### Conversion Script (Python)
```python
import pandas as pd
from datetime import datetime

# Read MT5 export
df = pd.read_csv('mt5_export.csv')

# Combine date and time, convert to Unix milliseconds
df['timestamp'] = pd.to_datetime(df['Date'] + ' ' + df['Time']).astype(int) // 10**6

# Rename columns
df['bid'] = df['Bid']
df['ask'] = df['Ask']
df['last'] = df['Last']
df['volume'] = df['Volume']

# Save in correct format
symbol = 'EURUSD'
output = df[['timestamp', 'bid', 'ask', 'last', 'volume']]
output.to_csv(f'apps/server/data/ticks/{symbol}_ticks.csv', index=False)

print(f"✅ Converted {len(output)} ticks for {symbol}")
```

---

## Example 2: Binance Crypto Trades

### Your Data Format
```json
[
  {"time": 1700000000000, "price": 43250.50, "qty": 0.05},
  {"time": 1700000001000, "price": 43251.00, "qty": 0.03}
]
```

### Conversion Script (Node.js)
```javascript
const fs = require('fs');

// Read Binance data
const trades = JSON.parse(fs.readFileSync('binance_trades.json'));

// Convert to tick format
const ticks = trades.map(trade => {
  const spread = trade.price * 0.0001; // 0.01% spread
  return {
    timestamp: trade.time,
    bid: trade.price - spread / 2,
    ask: trade.price + spread / 2,
    last: trade.price,
    volume: trade.qty * 1000 // Scale up for visibility
  };
});

// Save as CSV
const csv = [
  'timestamp,bid,ask,last,volume',
  ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
].join('\n');

fs.writeFileSync('apps/server/data/ticks/BTCUSD_ticks.csv', csv);
console.log(`✅ Converted ${ticks.length} ticks`);
```

---

## Example 3: Interactive Brokers (IB) Export

### Your Data Format
```csv
Symbol,DateTime,Open,High,Low,Close,Volume
EUR.USD,20240115 10:30:00,1.08450,1.08455,1.08448,1.08452,1000
```

### Conversion Script (Python)
```python
import pandas as pd

df = pd.read_csv('ib_export.csv')

# Parse datetime
df['timestamp'] = pd.to_datetime(df['DateTime'], format='%Y%m%d %H:%M:%S').astype(int) // 10**6

# Create bid/ask from OHLC
spread = 0.00002
df['bid'] = df['Close'] - spread / 2
df['ask'] = df['Close'] + spread / 2
df['last'] = df['Close']
df['volume'] = df['Volume']

# Extract symbol
symbol = df['Symbol'].iloc[0].replace('.', '')  # EUR.USD -> EURUSD

output = df[['timestamp', 'bid', 'ask', 'last', 'volume']]
output.to_csv(f'apps/server/data/ticks/{symbol}_ticks.csv', index=False)

print(f"✅ Converted {len(output)} ticks for {symbol}")
```

---

## Example 4: TradingView Export

### Your Data Format
```csv
time,open,high,low,close,volume
1700000000,1.08450,1.08455,1.08448,1.08452,1000
```

### Conversion Script (Node.js)
```javascript
const fs = require('fs');
const csv = require('csv-parser');

const ticks = [];

fs.createReadStream('tradingview_export.csv')
  .pipe(csv())
  .on('data', (row) => {
    const timestamp = parseInt(row.time) * 1000; // Convert to ms
    const close = parseFloat(row.close);
    const spread = 0.00002;
    
    ticks.push({
      timestamp,
      bid: close - spread / 2,
      ask: close + spread / 2,
      last: close,
      volume: parseFloat(row.volume)
    });
  })
  .on('end', () => {
    const output = [
      'timestamp,bid,ask,last,volume',
      ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
    ].join('\n');
    
    fs.writeFileSync('apps/server/data/ticks/EURUSD_ticks.csv', output);
    console.log(`✅ Converted ${ticks.length} ticks`);
  });
```

---

## Example 5: Yahoo Finance Data

### Your Data Format
```csv
Date,Open,High,Low,Close,Adj Close,Volume
2024-01-15,1.0845,1.0850,1.0840,1.0848,1.0848,0
```

### Conversion Script (Python)
```python
import pandas as pd

df = pd.read_csv('yahoo_finance.csv')

# Convert date to timestamp
df['timestamp'] = pd.to_datetime(df['Date']).astype(int) // 10**6

# Use Close as price
spread = 0.00002
df['bid'] = df['Close'] - spread / 2
df['ask'] = df['Close'] + spread / 2
df['last'] = df['Close']
df['volume'] = df['Volume'].fillna(100)

output = df[['timestamp', 'bid', 'ask', 'last', 'volume']]
output.to_csv('apps/server/data/ticks/EURUSD_ticks.csv', index=False)

print(f"✅ Converted {len(output)} ticks")
```

---

## Example 6: Custom API Data

### Your Data Format (JSON from API)
```json
{
  "data": [
    {"ts": 1700000000, "b": 1.08450, "a": 1.08452, "v": 100},
    {"ts": 1700000001, "b": 1.08451, "a": 1.08453, "v": 150}
  ]
}
```

### Conversion Script (Node.js)
```javascript
const fs = require('fs');

// Read API response
const response = JSON.parse(fs.readFileSync('api_data.json'));

// Convert to tick format
const ticks = response.data.map(item => ({
  timestamp: item.ts * 1000, // Convert to milliseconds
  bid: item.b,
  ask: item.a,
  last: (item.b + item.a) / 2,
  volume: item.v
}));

// Save as CSV
const csv = [
  'timestamp,bid,ask,last,volume',
  ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
].join('\n');

fs.writeFileSync('apps/server/data/ticks/EURUSD_ticks.csv', csv);
console.log(`✅ Converted ${ticks.length} ticks`);
```

---

## Example 7: Database Export

### Your Data (PostgreSQL)
```sql
SELECT 
  EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp,
  bid_price as bid,
  ask_price as ask,
  last_price as last,
  volume
FROM ticks
WHERE symbol = 'EURUSD'
ORDER BY timestamp;
```

### Export to CSV
```bash
psql -d trading_db -c "COPY (
  SELECT 
    EXTRACT(EPOCH FROM timestamp) * 1000 as timestamp,
    bid_price,
    ask_price,
    last_price,
    volume
  FROM ticks
  WHERE symbol = 'EURUSD'
  ORDER BY timestamp
) TO STDOUT WITH CSV HEADER" > EURUSD_ticks.csv

# Move to data folder
mv EURUSD_ticks.csv apps/server/data/ticks/
```

---

## Example 8: Excel/Google Sheets

### Your Data (Excel)
```
| Date       | Time     | Price   | Volume |
|------------|----------|---------|--------|
| 2024-01-15 | 10:30:00 | 1.08451 | 100    |
```

### Conversion Steps

1. **Add timestamp column** in Excel:
   ```excel
   =(A2+B2-DATE(1970,1,1))*86400*1000
   ```

2. **Add bid/ask columns:**
   ```excel
   Bid: =C2-0.00001
   Ask: =C2+0.00001
   ```

3. **Export as CSV** with columns:
   - timestamp, bid, ask, last, volume

4. **Save as:** `EURUSD_ticks.csv`

5. **Copy to folder:**
   ```bash
   cp EURUSD_ticks.csv apps/server/data/ticks/
   ```

---

## Example 9: Multiple Files (Large Dataset)

If you have data split by date:

```
my_data/
├── EURUSD_2024_01_15.csv
├── EURUSD_2024_01_16.csv
├── EURUSD_2024_01_17.csv
```

### Merge and Convert (Python)
```python
import pandas as pd
import glob

# Read all files
files = glob.glob('my_data/EURUSD_*.csv')
dfs = [pd.read_csv(f) for f in files]
df = pd.concat(dfs, ignore_index=True)

# Convert timestamps if needed
if df['timestamp'].max() < 10000000000:
    df['timestamp'] = df['timestamp'] * 1000

# Sort by timestamp
df = df.sort_values('timestamp')

# Save merged file
df.to_csv('apps/server/data/ticks/EURUSD_ticks.csv', index=False)
print(f"✅ Merged {len(files)} files, {len(df)} total ticks")
```

---

## Example 10: Real-Time Data Stream

### Capture Live Data (Node.js)
```javascript
const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('wss://your-data-provider.com/stream');
const ticks = [];

ws.on('message', (data) => {
  const tick = JSON.parse(data);
  
  ticks.push({
    timestamp: Date.now(),
    bid: tick.bid,
    ask: tick.ask,
    last: tick.last || (tick.bid + tick.ask) / 2,
    volume: tick.volume || 100
  });
  
  // Save every 1000 ticks
  if (ticks.length >= 1000) {
    saveTicks();
  }
});

function saveTicks() {
  const csv = [
    'timestamp,bid,ask,last,volume',
    ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
  ].join('\n');
  
  const filename = `apps/server/data/ticks/EURUSD_${Date.now()}.csv`;
  fs.writeFileSync(filename, csv);
  console.log(`✅ Saved ${ticks.length} ticks to ${filename}`);
  
  ticks.length = 0; // Clear array
}
```

---

## Quick Reference: Common Conversions

### Timestamp Conversions

```javascript
// Seconds to milliseconds
timestamp_ms = timestamp_sec * 1000;

// ISO string to milliseconds
timestamp_ms = new Date('2024-01-15T10:30:00Z').getTime();

// Date object to milliseconds
timestamp_ms = new Date(2024, 0, 15, 10, 30, 0).getTime();
```

### Price to Bid/Ask

```javascript
// Forex (0.2 pip spread)
const spread = 0.00002;
bid = price - spread / 2;
ask = price + spread / 2;

// Crypto (0.01% spread)
const spread = price * 0.0001;
bid = price - spread / 2;
ask = price + spread / 2;

// Stocks (0.01 spread)
const spread = 0.01;
bid = price - spread / 2;
ask = price + spread / 2;
```

---

## Testing Your Conversion

After converting, always test:

```bash
# 1. Validate the file
node scripts/validate-ticks.js apps/server/data/ticks/EURUSD_ticks.csv

# 2. Check first few lines
head -n 5 apps/server/data/ticks/EURUSD_ticks.csv

# 3. Start server and check logs
npm run dev:server

# 4. Test API
curl http://localhost:3001/api/symbols
curl "http://localhost:3001/api/candles/EURUSD?tf=5m"
```

---

## Need Help?

1. Use the conversion script: `npm run convert your_file.csv EURUSD`
2. Validate your file: `npm run validate apps/server/data/ticks/EURUSD_ticks.csv`
3. Check sample files: `cat apps/server/data/ticks/EURUSD_sample.csv`
4. Review TICK_DATA_GUIDE.md for detailed format specs

Once converted, your candlesticks will be generated automatically! 🎉
