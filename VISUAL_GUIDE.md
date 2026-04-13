# Visual Guide - From Tick Data to Candlesticks

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR TICK DATA                                │
│  (CSV, JSON, or GZIP files with timestamp, bid, ask, volume)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PLACE IN DATA FOLDER                            │
│         apps/server/data/ticks/EURUSD_ticks.csv                 │
│                                                                   │
│  IMPORTANT: Filename MUST start with 6-letter symbol!           │
│  ✅ EURUSD_ticks.csv  ✅ GBPUSD_data.csv                        │
│  ❌ ticks_EURUSD.csv  ❌ data.csv                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    START SERVER                                  │
│                   npm run dev                                    │
│                                                                   │
│  Server automatically:                                           │
│  1. Detects symbols from filenames                              │
│  2. Parses tick data (CSV/JSON/GZIP)                           │
│  3. Loads into memory                                           │
│  4. Ready to serve data                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  OPEN BROWSER                                    │
│              http://localhost:5173                               │
│                                                                   │
│  You see:                                                        │
│  • Watchlist with your symbols (EURUSD, GBPUSD, etc.)          │
│  • Click any symbol to load chart                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SELECT TIMEFRAME                                    │
│   [1s] [5s] [30s] [1m] [5m] [15m] [1h] [4h] [1D] [1W] [1M]    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           AUTOMATIC CANDLESTICK GENERATION                       │
│                                                                   │
│  Server aggregates ticks into candles:                          │
│                                                                   │
│  Example: 5-minute candles                                      │
│  ┌──────────────────────────────────────┐                      │
│  │ Ticks from 10:00:00 to 10:04:59      │                      │
│  │ • 10:00:00 - 1.08450 (first = OPEN)  │                      │
│  │ • 10:01:30 - 1.08470 (highest)       │                      │
│  │ • 10:02:15 - 1.08440 (lowest)        │                      │
│  │ • 10:04:59 - 1.08460 (last = CLOSE)  │                      │
│  │ • Volume = sum of all tick volumes   │                      │
│  └──────────────────────────────────────┘                      │
│                    ↓                                             │
│  Creates one 5-minute candle:                                   │
│  • Open: 1.08450                                                │
│  • High: 1.08470                                                │
│  • Low: 1.08440                                                 │
│  • Close: 1.08460                                               │
│  • Volume: 12,450                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CHART DISPLAYS                                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │     📈 Beautiful Candlestick Chart                      │    │
│  │                                                          │    │
│  │        ▲                                                │    │
│  │     ┌──┴──┐                                            │    │
│  │     │  │  │     ┌──┐                                   │    │
│  │  ┌──┤  │  ├──┐  │  │  ┌──┐                            │    │
│  │  │  │  │  │  │  │  │  │  │                            │    │
│  │  │  └──┴──┘  │  └──┘  │  │                            │    │
│  │  │           │         │  │                            │    │
│  │  └───────────┘         └──┘                            │    │
│  │                                                          │    │
│  │  + Volume bars below                                    │    │
│  │  + Indicators (SMA, EMA, RSI, MACD, BB)                │    │
│  │  + Drawing tools                                        │    │
│  │  + Crosshair with OHLCV tooltip                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tick Data Format Explained

### What You Need

```csv
timestamp,bid,ask,last,volume
1700000000000,1.08450,1.08452,1.08451,100
```

### Field Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ timestamp: 1700000000000                                     │
│ ├─ Unix milliseconds (13 digits)                            │
│ ├─ NOT seconds (10 digits)                                  │
│ └─ Example: Date.now() in JavaScript                        │
├─────────────────────────────────────────────────────────────┤
│ bid: 1.08450                                                 │
│ └─ Bid price (price to sell at)                            │
├─────────────────────────────────────────────────────────────┤
│ ask: 1.08452                                                 │
│ └─ Ask price (price to buy at)                             │
├─────────────────────────────────────────────────────────────┤
│ last: 1.08451                                                │
│ ├─ Last traded price                                        │
│ └─ Optional: If missing, uses (bid + ask) / 2              │
├─────────────────────────────────────────────────────────────┤
│ volume: 100                                                  │
│ ├─ Tick volume                                              │
│ └─ Optional: Defaults to 100 if missing                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Filename Format

```
┌──────────────────────────────────────────────────────────┐
│  EURUSD_ticks_2024.csv                                    │
│  ^^^^^^ ^^^^^^^^^^^^^^                                    │
│    │         │                                             │
│    │         └─ Rest of filename (anything)               │
│    │                                                       │
│    └─ MUST be 6-letter currency pair                      │
│       Examples: EURUSD, GBPUSD, USDJPY, AUDUSD           │
│                                                            │
│  ✅ Valid:                                                 │
│     EURUSD_ticks.csv                                      │
│     GBPUSD_2024_january.csv                               │
│     USDJPY_data.json                                      │
│     AUDUSD_ticks.csv.gz                                   │
│                                                            │
│  ❌ Invalid:                                               │
│     ticks_EURUSD.csv    (symbol not first)                │
│     EUR_USD.csv         (not 6 letters)                   │
│     data.csv            (no symbol)                       │
│     EURUSD.csv          (too short, add _something)       │
└──────────────────────────────────────────────────────────┘
```

---

## Conversion Examples

### Example 1: Only Have Price

```
Your data:
┌────────────────────────────┐
│ timestamp,price,volume     │
│ 1700000000000,1.08451,100  │
└────────────────────────────┘
         │
         ▼
    Converter adds bid/ask
         │
         ▼
┌────────────────────────────────────────────────┐
│ timestamp,bid,ask,last,volume                  │
│ 1700000000000,1.08450,1.08452,1.08451,100     │
│                                                 │
│ bid = price - 0.00001                          │
│ ask = price + 0.00001                          │
│ last = price                                   │
└────────────────────────────────────────────────┘

Command: npm run convert your_data.csv EURUSD
```

### Example 2: Timestamps in Seconds

```
Your data:
┌────────────────────────────┐
│ timestamp,bid,ask          │
│ 1700000000,1.08450,1.08452 │  ← 10 digits (seconds)
└────────────────────────────┘
         │
         ▼
    Converter multiplies by 1000
         │
         ▼
┌────────────────────────────────┐
│ timestamp,bid,ask,last,volume  │
│ 1700000000000,1.08450,1.08452  │  ← 13 digits (milliseconds)
└────────────────────────────────┘

Command: npm run convert your_data.csv EURUSD
```

---

## Timeframe Aggregation Visual

```
Raw Ticks (every second):
│
├─ 10:00:00 → 1.08450
├─ 10:00:01 → 1.08451
├─ 10:00:02 → 1.08449
├─ 10:00:03 → 1.08452
├─ 10:00:04 → 1.08453
│
└─ Aggregated into 5-second candle:
   ┌─────────────────────────┐
   │ Time: 10:00:00          │
   │ Open: 1.08450 (first)   │
   │ High: 1.08453 (max)     │
   │ Low: 1.08449 (min)      │
   │ Close: 1.08453 (last)   │
   │ Volume: sum of all      │
   └─────────────────────────┘

Same ticks, different timeframes:
├─ 1s candles → 5 candles
├─ 5s candles → 1 candle
├─ 1m candles → 1 candle (if < 1 minute of data)
└─ All generated automatically!
```

---

## Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TopBar: [Logo] EURUSD • Bid: 1.08471 Ask: 1.08478 +0.15%     │
├──────────┬──────────────────────────────────┬───────────────────┤
│          │ [1s][5s][1m][5m][15m][1h][4D]   │                   │
│          │ [Candlestick][Line][Area][Bar]  │                   │
│ Watchlist├──────────────────────────────────┤  Order Panel      │
│          │                                  │                   │
│ EURUSD   │         📈 Chart Area            │  [BUY] [SELL]     │
│ GBPUSD   │                                  │                   │
│ USDJPY   │    (Candlesticks display here)  │  Volume: 0.01     │
│ AUDUSD   │                                  │                   │
│          │                                  │  [Place Order]    │
│ [Search] │         Volume Sub-chart         │                   │
│          │                                  │  Positions:       │
│          │         Indicator Sub-charts     │  • EURUSD Buy     │
│          │                                  │    P&L: +$45.20   │
├──────────┴──────────────────────────────────┴───────────────────┤
│  StatusBar: Spread: 0.7 • Last Tick: 10:30:45 • Connected      │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Happens When You Click a Symbol

```
1. Click "EURUSD" in watchlist
   │
   ▼
2. Client requests: GET /api/candles/EURUSD?tf=5m
   │
   ▼
3. Server:
   ├─ Loads EURUSD tick files
   ├─ Aggregates ticks into 5-minute buckets
   ├─ Calculates OHLCV for each bucket
   └─ Returns candle array
   │
   ▼
4. Client:
   ├─ Receives candles
   ├─ Renders on chart
   └─ Subscribes to WebSocket for live updates
   │
   ▼
5. WebSocket streams new ticks in real-time
   │
   ▼
6. Chart updates live as ticks arrive!
```

---

## Validation Checklist

```
Before starting, verify:

┌─ File Location ────────────────────────────────────┐
│ ✓ File in apps/server/data/ticks/                 │
│ ✓ Filename starts with 6-letter symbol            │
└────────────────────────────────────────────────────┘

┌─ File Format ──────────────────────────────────────┐
│ ✓ CSV has header row                              │
│ ✓ Columns: timestamp, bid, ask, last, volume      │
│ ✓ At least 2 rows (header + data)                 │
└────────────────────────────────────────────────────┘

┌─ Data Validity ────────────────────────────────────┐
│ ✓ Timestamps are 13 digits (milliseconds)         │
│ ✓ Bid < Ask (spread is positive)                  │
│ ✓ All numbers are valid (not NaN)                 │
│ ✓ Timestamps are sorted (oldest first)            │
└────────────────────────────────────────────────────┘

Run validator:
$ npm run validate apps/server/data/ticks/EURUSD_ticks.csv
```

---

## Success Indicators

```
✅ Server starts successfully
   └─ Console shows: "Detected symbols: EURUSD, GBPUSD, ..."

✅ Symbol appears in watchlist
   └─ Left sidebar shows your symbols

✅ Chart loads when clicked
   └─ Candlesticks display in main area

✅ Can switch timeframes
   └─ Click different timeframe buttons

✅ WebSocket connected
   └─ Status bar shows "Connected" in green

✅ Ticks streaming
   └─ Chart updates in real-time
```

---

## Quick Troubleshooting

```
Problem: No symbols detected
├─ Check: Filename starts with 6 letters?
├─ Check: File in apps/server/data/ticks/?
└─ Fix: Rename file or move to correct folder

Problem: Chart shows "No data"
├─ Check: Timestamps are milliseconds (13 digits)?
├─ Check: CSV has header row?
└─ Fix: Run converter or validate file

Problem: Dates are wrong (1970 or future)
├─ Check: Timestamps in milliseconds, not seconds?
└─ Fix: Multiply timestamps by 1000

Problem: Server crashes
├─ Check: File size > 100 MB?
└─ Fix: Compress with gzip or split file
```

---

## Summary

```
┌────────────────────────────────────────────────────────┐
│  1. Add tick data to apps/server/data/ticks/          │
│  2. Name file: SYMBOL_anything.csv                     │
│  3. Run: npm run dev                                   │
│  4. Open: http://localhost:5173                        │
│  5. Click symbol in watchlist                          │
│  6. Select timeframe                                   │
│  7. Candlesticks appear automatically! 🎉             │
└────────────────────────────────────────────────────────┘
```

**That's it! Your tick data becomes beautiful candlesticks on any timeframe.**

For detailed instructions, see:
- **START_HERE.md** - Quick start
- **HOW_TO_ADD_YOUR_DATA.md** - Data format guide
- **EXAMPLES.md** - Real-world examples
