#!/usr/bin/env python3
"""
Convert existing tick data to trading terminal format

Converts tick data from TICKS folder to the format required by the trading terminal.

Usage:
    python scripts/convert_existing_ticks.py
    python scripts/convert_existing_ticks.py EURUSD
    python scripts/convert_existing_ticks.py EURUSD 2024
"""

import sys
import os
import csv
from datetime import datetime
import glob

def parse_timestamp(time_str):
    """Convert various timestamp formats to Unix milliseconds"""
    try:
        # Try ISO format: 2026-03-01 22:00:01.195
        dt = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S.%f')
        return int(dt.timestamp() * 1000)
    except:
        pass
    
    try:
        # Try without microseconds
        dt = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
        return int(dt.timestamp() * 1000)
    except:
        pass
    
    try:
        # Try Unix timestamp (seconds)
        timestamp = float(time_str)
        if timestamp < 10000000000:  # Likely seconds
            return int(timestamp * 1000)
        else:  # Already milliseconds
            return int(timestamp)
    except:
        pass
    
    return None

def convert_tick_file(input_file, output_file):
    """Convert a single tick file"""
    print(f"  Converting {os.path.basename(input_file)}...")
    
    ticks = []
    errors = 0
    
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            try:
                # Parse timestamp
                timestamp = parse_timestamp(row.get('time', row.get('timestamp', '')))
                
                if not timestamp:
                    errors += 1
                    continue
                
                # Parse prices
                bid = float(row.get('bid', 0))
                ask = float(row.get('ask', 0))
                
                # Calculate last price if not provided
                last = float(row.get('last', (bid + ask) / 2))
                
                # Parse volume
                volume = int(float(row.get('volume', row.get('ask_volume', row.get('bid_volume', 100)))))
                
                if bid > 0 and ask > 0:
                    ticks.append({
                        'timestamp': timestamp,
                        'bid': bid,
                        'ask': ask,
                        'last': last,
                        'volume': max(100, volume)
                    })
            except Exception as e:
                errors += 1
                continue
    
    if not ticks:
        print(f"    ⚠️  No valid ticks found")
        return 0
    
    # Sort by timestamp
    ticks.sort(key=lambda x: x['timestamp'])
    
    # Write output
    with open(output_file, 'w', newline='') as f:
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
    
    print(f"    ✅ Converted {len(ticks):,} ticks ({errors} errors)")
    return len(ticks)

def convert_symbol(symbol, year=None):
    """Convert all tick files for a symbol"""
    print(f"\n📊 Converting {symbol}")
    
    # Find input files
    if year:
        pattern = f"TICKS/{symbol.lower()}_ticks_{year}_*.csv"
    else:
        pattern = f"TICKS/{symbol.lower()}_ticks*.csv"
    
    input_files = glob.glob(pattern)
    
    if not input_files:
        print(f"  ⚠️  No files found matching: {pattern}")
        return
    
    print(f"  Found {len(input_files)} file(s)")
    
    output_dir = os.path.join('apps', 'server', 'data', 'ticks')
    os.makedirs(output_dir, exist_ok=True)
    
    total_ticks = 0
    
    for input_file in sorted(input_files):
        # Generate output filename
        basename = os.path.basename(input_file)
        output_file = os.path.join(output_dir, basename.upper())
        
        ticks = convert_tick_file(input_file, output_file)
        total_ticks += ticks
    
    print(f"  ✅ Total: {total_ticks:,} ticks converted")

def main():
    print("🔄 Tick Data Converter")
    print("   Converting TICKS folder data to trading terminal format\n")
    
    if len(sys.argv) > 1:
        # Convert specific symbol
        symbol = sys.argv[1].upper()
        year = int(sys.argv[2]) if len(sys.argv) > 2 else None
        convert_symbol(symbol, year)
    else:
        # Convert all symbols
        symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF']
        
        for symbol in symbols:
            # Check if files exist
            pattern = f"TICKS/{symbol.lower()}_ticks*.csv"
            if glob.glob(pattern):
                convert_symbol(symbol)
    
    print(f"\n🎉 Conversion complete!")
    print(f"   Files saved to: apps/server/data/ticks/")
    print(f"   Restart the server to load the new data.")

if __name__ == '__main__':
    main()
