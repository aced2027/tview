#!/usr/bin/env python3
"""
Direct Dukascopy Tick Downloader
Downloads tick data directly from Dukascopy's HTTP API and converts to CSV.
No external tools needed - pure Python solution.
"""

import requests
import lzma
import struct
import csv
import os
from datetime import datetime, timedelta
from pathlib import Path

# CONFIG
OUTPUT_DIR = r"Z:\TV\apps\server\data\ticks"
PAIRS = ["AUDUSD", "GBPUSD", "USDJPY", "USDCHF"]
YEAR = 2024
MONTHS = [1, 2, 3]  # January, February, March

# Dukascopy API base URL
BASE_URL = "https://datafeed.dukascopy.com/datafeed"

def download_hour(pair, year, month, day, hour):
    """Download one hour of tick data from Dukascopy."""
    # Dukascopy uses 0-indexed months and days
    month_idx = month - 1
    day_idx = day - 1
    
    url = f"{BASE_URL}/{pair}/{year:04d}/{month_idx:02d}/{day_idx:02d}/{hour:02d}h_ticks.bi5"
    
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200 and len(response.content) > 0:
            return response.content
        return None
    except Exception as e:
        print(f"  Error downloading {pair} {year}-{month:02d}-{day:02d} {hour:02d}h: {e}")
        return None

def decode_bi5(data, hour_dt):
    """Decode Dukascopy .bi5 binary format to ticks."""
    if not data or len(data) == 0:
        return []
    
    try:
        # Decompress LZMA
        decompressed = lzma.decompress(data)
        record_size = 20
        n_records = len(decompressed) // record_size
        
        ticks = []
        hour_ts_ms = int(hour_dt.timestamp() * 1000)
        
        for i in range(n_records):
            offset = i * record_size
            chunk = decompressed[offset : offset + record_size]
            
            # Unpack: ms_offset, ask, bid, ask_vol, bid_vol
            ms_offset, ask_raw, bid_raw, ask_vol, bid_vol = struct.unpack(">IIIff", chunk)
            
            timestamp_ms = hour_ts_ms + ms_offset
            ask = ask_raw / 100000.0
            bid = bid_raw / 100000.0
            
            ticks.append({
                "timestamp_ms": timestamp_ms,
                "datetime_utc": datetime.utcfromtimestamp(timestamp_ms / 1000).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "ask": round(ask, 5),
                "bid": round(bid, 5),
                "ask_volume": round(ask_vol, 2),
                "bid_volume": round(bid_vol, 2),
            })
        
        return ticks
    
    except Exception as e:
        print(f"  Error decoding data: {e}")
        return []

def download_month(pair, year, month):
    """Download all ticks for one month."""
    print(f"\n{'='*60}")
    print(f"  Downloading {pair} - {year}-{month:02d}")
    print(f"{'='*60}")
    
    # Get number of days in month
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    
    last_day = (next_month - timedelta(days=1)).day
    
    all_ticks = []
    total_hours = last_day * 24
    processed = 0
    
    for day in range(1, last_day + 1):
        for hour in range(24):
            dt = datetime(year, month, day, hour)
            data = download_hour(pair, year, month, day, hour)
            
            if data:
                ticks = decode_bi5(data, dt)
                if ticks:
                    all_ticks.extend(ticks)
            
            processed += 1
            if processed % 24 == 0 or processed == total_hours:
                print(f"  Progress: {processed}/{total_hours} hours | {len(all_ticks):,} ticks")
    
    if not all_ticks:
        print(f"  ⚠ No data downloaded for {pair} {year}-{month:02d}")
        return
    
    # Sort by timestamp
    all_ticks.sort(key=lambda x: x["timestamp_ms"])
    
    # Write CSV
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{pair}_TICKS_{year}_{month:02d}.csv"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp_ms", "datetime_utc", "ask", "bid", "ask_volume", "bid_volume"])
        writer.writeheader()
        writer.writerows(all_ticks)
    
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  ✅ Saved {filename} - {len(all_ticks):,} ticks ({size_kb:.1f} KB)")

def main():
    print("\n" + "="*60)
    print("  DUKASCOPY DIRECT DOWNLOADER")
    print("  Pure Python - No external tools needed")
    print("="*60)
    print(f"\n  Pairs: {', '.join(PAIRS)}")
    print(f"  Year: {YEAR}")
    print(f"  Months: {', '.join(str(m) for m in MONTHS)}")
    print(f"  Output: {OUTPUT_DIR}\n")
    
    response = input("Start download? (y/n): ").strip().lower()
    if response != "y":
        print("Aborted.")
        return
    
    for pair in PAIRS:
        for month in MONTHS:
            download_month(pair, YEAR, month)
    
    print(f"\n{'='*60}")
    print("  ✅ DOWNLOAD COMPLETE!")
    print(f"  Output directory: {OUTPUT_DIR}")
    print("="*60)
    print("\n  Next step: Restart your server to load the new data.\n")

if __name__ == "__main__":
    main()
