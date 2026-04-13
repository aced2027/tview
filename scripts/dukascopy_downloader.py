#!/usr/bin/env python3
"""
Dukascopy Tick Data Downloader

Downloads historical tick data from Dukascopy and converts it to the format
required by the trading terminal.

Usage:
    python scripts/dukascopy_downloader.py EURUSD 2024 1
    python scripts/dukascopy_downloader.py GBPUSD 2024 1 12  # Jan to Dec
"""

import sys
import os
import requests
import struct
import lzma
from datetime import datetime, timedelta
import csv

# Dukascopy symbol mapping
SYMBOL_MAP = {
    'EURUSD': 'EURUSD',
    'GBPUSD': 'GBPUSD',
    'USDJPY': 'USDJPY',
    'AUDUSD': 'AUDUSD',
    'USDCHF': 'USDCHF',
    'USDCAD': 'USDCAD',
    'NZDUSD': 'NZDUSD',
    'EURGBP': 'EURGBP',
    'EURJPY': 'EURJPY',
    'GBPJPY': 'GBPJPY',
}

def download_dukascopy_ticks(symbol, year, month, day, hour):
    """Download tick data from Dukascopy for a specific hour"""
    
    base_url = "https://datafeed.dukascopy.com/datafeed"
    url = f"{base_url}/{symbol}/{year}/{month:02d}/{day:02d}/{hour:02d}h_ticks.bi5"
    
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            return response.content
        else:
            print(f"  ⚠️  No data for {year}-{month:02d}-{day:02d} {hour:02d}:00")
            return None
    except Exception as e:
        print(f"  ❌ Error downloading: {e}")
        return None

def decompress_bi5(data):
    """Decompress .bi5 file"""
    try:
        return lzma.decompress(data)
    except Exception as e:
        print(f"  ❌ Decompression error: {e}")
        return None

def parse_ticks(data, base_timestamp):
    """Parse binary tick data"""
    ticks = []
    
    # Each tick is 20 bytes: time(4), ask(4), bid(4), ask_vol(4), bid_vol(4)
    tick_size = 20
    num_ticks = len(data) // tick_size
    
    for i in range(num_ticks):
        offset = i * tick_size
        tick_data = data[offset:offset + tick_size]
        
        if len(tick_data) < tick_size:
            break
        
        # Unpack binary data (big-endian integers)
        time_offset, ask, bid, ask_vol, bid_vol = struct.unpack('>5i', tick_data)
        
        # Calculate timestamp (milliseconds)
        timestamp = base_timestamp + time_offset
        
        # Convert prices (Dukascopy uses point values)
        ask_price = ask / 100000.0
        bid_price = bid / 100000.0
        last_price = (ask_price + bid_price) / 2
        
        # Volume (use ask volume as total)
        volume = ask_vol / 1000000.0  # Convert to lots
        
        ticks.append({
            'timestamp': timestamp,
            'bid': bid_price,
            'ask': ask_price,
            'last': last_price,
            'volume': max(100, int(volume))  # Minimum 100
        })
    
    return ticks

def download_month(symbol, year, month):
    """Download all ticks for a specific month"""
    print(f"\n📅 Downloading {symbol} for {year}-{month:02d}")
    
    all_ticks = []
    
    # Determine days in month
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    
    days_in_month = (next_month - datetime(year, month, 1)).days
    
    for day in range(1, days_in_month + 1):
        print(f"  Day {day:02d}...", end=" ")
        day_ticks = 0
        
        for hour in range(24):
            # Base timestamp for this hour
            dt = datetime(year, month, day, hour, 0, 0)
            base_timestamp = int(dt.timestamp() * 1000)
            
            # Download data
            data = download_dukascopy_ticks(symbol, year, month - 1, day, hour)  # Dukascopy uses 0-indexed months
            
            if data:
                # Decompress
                decompressed = decompress_bi5(data)
                
                if decompressed:
                    # Parse ticks
                    ticks = parse_ticks(decompressed, base_timestamp)
                    all_ticks.extend(ticks)
                    day_ticks += len(ticks)
        
        print(f"✅ {day_ticks:,} ticks")
    
    return all_ticks

def save_ticks_csv(ticks, symbol, year, month):
    """Save ticks to CSV file"""
    output_dir = os.path.join('apps', 'server', 'data', 'ticks')
    os.makedirs(output_dir, exist_ok=True)
    
    filename = os.path.join(output_dir, f'{symbol}_ticks_{year}_{month:02d}.csv')
    
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', 'bid', 'ask', 'last', 'volume'])
        
        for tick in ticks:
            writer.writerow([
                tick['timestamp'],
                f"{tick['bid']:.5f}",
                f"{tick['ask']:.5f}",
                f"{tick['last']:.5f}",
                tick['volume']
            ])
    
    print(f"\n✅ Saved {len(ticks):,} ticks to {filename}")
    return filename

def main():
    if len(sys.argv) < 4:
        print("""
Dukascopy Tick Data Downloader

Usage:
    python scripts/dukascopy_downloader.py SYMBOL YEAR MONTH_START [MONTH_END]

Examples:
    python scripts/dukascopy_downloader.py EURUSD 2024 1        # January 2024
    python scripts/dukascopy_downloader.py GBPUSD 2024 1 3      # Jan-Mar 2024
    python scripts/dukascopy_downloader.py USDJPY 2024 1 12     # Full year 2024

Supported symbols:
    EURUSD, GBPUSD, USDJPY, AUDUSD, USDCHF, USDCAD, NZDUSD,
    EURGBP, EURJPY, GBPJPY
        """)
        sys.exit(1)
    
    symbol = sys.argv[1].upper()
    year = int(sys.argv[2])
    month_start = int(sys.argv[3])
    month_end = int(sys.argv[4]) if len(sys.argv) > 4 else month_start
    
    if symbol not in SYMBOL_MAP:
        print(f"❌ Unsupported symbol: {symbol}")
        print(f"   Supported: {', '.join(SYMBOL_MAP.keys())}")
        sys.exit(1)
    
    print(f"🚀 Dukascopy Tick Data Downloader")
    print(f"   Symbol: {symbol}")
    print(f"   Period: {year}-{month_start:02d} to {year}-{month_end:02d}")
    
    for month in range(month_start, month_end + 1):
        ticks = download_month(symbol, year, month)
        
        if ticks:
            save_ticks_csv(ticks, symbol, year, month)
        else:
            print(f"⚠️  No ticks downloaded for {year}-{month:02d}")
    
    print(f"\n🎉 Download complete!")
    print(f"   Restart the server to load the new data.")

if __name__ == '__main__':
    main()
