# Tick Data Sources Comparison

## Available Download Scripts

### 1. Histdata.com (Recommended) ⭐
**Script:** `download_histdata.py`

**Pros:**
- Reliable and stable downloads
- 23 major forex pairs available
- Data from 2000 onwards
- Simple HTTP downloads (no special tools)
- Auto-extracts CSV files
- Free, no registration required
- Good data quality

**Cons:**
- 2-second delay between requests (polite scraping)
- Slower for large date ranges
- ASCII format (needs conversion for some uses)

**Best for:**
- Getting started quickly
- Reliable historical data
- Major forex pairs
- When you need data from 2000-2024

**Usage:**
```bash
cd apps/server/scripts
python download_histdata.py
```

**Output format:**
```
DAT_ASCII_EURUSD_T_202401.csv
Columns: Date,Time,Bid,Ask,Volume
```

---

### 2. Dukascopy Direct
**Script:** `download_dukascopy_direct.py`

**Pros:**
- High-quality tick data
- More granular timestamps (milliseconds)
- Direct from Swiss bank source
- Includes bid/ask volumes
- No rate limiting

**Cons:**
- More complex binary format (.bi5)
- Requires LZMA decompression
- Can be slower for large ranges
- Sometimes has gaps in data

**Best for:**
- High-precision tick data
- When you need millisecond accuracy
- Professional trading applications
- Recent data (2010+)

**Usage:**
```bash
cd apps/server/scripts
python download_dukascopy_direct.py
```

**Output format:**
```
AUDUSD_TICKS_2024_01.csv
Columns: timestamp_ms,datetime_utc,ask,bid,ask_volume,bid_volume
```

---

### 3. Dukascopy CLI (Not Recommended)
**Script:** `download_ticks_fast.py`

**Status:** ⚠️ Has issues with empty files

**Pros:**
- Uses official dukascopy-node tool
- Parallel downloads
- Caching support

**Cons:**
- Requires Node.js and global npm install
- CLI flags vary by version
- Often produces 0-byte files
- Conversion step can fail silently
- Complex troubleshooting

**Recommendation:** Use Histdata.com or Dukascopy Direct instead.

---

## Quick Comparison Table

| Feature | Histdata.com | Dukascopy Direct | Dukascopy CLI |
|---------|--------------|------------------|---------------|
| Ease of use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Data quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Setup complexity | Low | Low | High |
| Dependencies | requests | requests | Node.js, npm |
| Date range | 2000-2024 | 2010-2024 | 2010-2024 |
| Pairs available | 23 major | All Dukascopy | All Dukascopy |

---

## Recommendation

**For most users:** Start with `download_histdata.py`
- Easiest to use
- Most reliable
- Good enough for bar replay and backtesting
- Works out of the box

**For professional use:** Use `download_dukascopy_direct.py`
- Higher precision
- Better for tick-level analysis
- More accurate bid/ask spreads

**Avoid:** `download_ticks_fast.py` (CLI wrapper)
- Too many failure modes
- Complex troubleshooting
- Better alternatives available

---

## Installation

All scripts require Python 3.7+ and requests:

```bash
pip install requests beautifulsoup4
```

That's it! No other dependencies needed.

---

## Data Format Conversion

If you need to convert between formats, see `convert_bi5_to_csv.py` for examples of:
- Binary .bi5 → CSV
- Timestamp conversions
- Price scaling (Dukascopy uses price * 100000)
