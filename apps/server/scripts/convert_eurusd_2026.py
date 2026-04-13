#!/usr/bin/env python3
"""
Convert EURUSD 2026 Histdata files to server format
"""

import os
import csv
from datetime import datetime

INPUT_DIR = r"Z:\TV\apps\server\data\ticks"
OUTPUT_DIR = r"Z:\TV\apps\server\data\ticks"

def parse_histdata_row(date_time_str: str, bid: str, ask: str) -> dict:
    """
    Parse Histdata format: YYYYMMDD HHMMSSmmm,bid,ask,volume
    Example: 20260101 170401135,1.173870,1.175320,0
    """
    # Split date and time
    date_part = date_time_str[:8]  # YYYYMMDD
    time_part = date_time_str[9:]  # HHMMSSmmm
    
    year = int(date_part[0:4])
    month = int(date_part[4:6])
    day = int(date_part[6:8])
    
    hour = int(time_part[0:2])
    minute = int(time_part[2:4])
    second = int(time_part[4:6])
    millisecond = int(time_part[6:9]) if len(time_part) >= 9 else 0
    
    dt = datetime(year, month, day, hour, minute, second, millisecond * 1000)
    timestamp_ms = int(dt.timestamp() * 1000)
    
    bid_price = float(bid)
    ask_price = float(ask)
    last_price = (bid_price + ask_price) / 2
    
    return {
        'timestamp': timestamp_ms,
        'bid': bid_price,
        'ask': ask_price,
        'last': last_price,
        'volume': 0
    }

def convert_file(input_file: str, output_file: str):
    """Convert one Histdata file to server format"""
    print(f"  Converting {os.path.basename(input_file)}...", end=" ")
    
    ticks = []
    with open(input_file, 'r') as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) >= 3:
                try:
                    tick = parse_histdata_row(parts[0], parts[1], parts[2])
                    ticks.append(tick)
                except:
                    continue
    
    # Write output
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['timestamp', 'bid', 'ask', 'last', 'volume'])
        writer.writeheader()
        writer.writerows(ticks)
    
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"OK ({len(ticks):,} ticks, {size_mb:.1f} MB)")
    return len(ticks)

def main():
    print("="*60)
    print("  Converting EURUSD 2026 Data")
    print("="*60)
    
    files_to_convert = [
        ("DAT_ASCII_EURUSD_T_202601.csv", "EURUSD_TICKS_2026_01.csv"),
        ("DAT_ASCII_EURUSD_T_202602.csv", "EURUSD_TICKS_2026_02.csv"),
        ("DAT_ASCII_EURUSD_T_202603.csv", "EURUSD_TICKS_2026_03.csv"),
        ("DAT_ASCII_EURUSD_T_202604.csv", "EURUSD_TICKS_2026_04.csv"),
    ]
    
    total_ticks = 0
    converted = 0
    
    for input_name, output_name in files_to_convert:
        input_path = os.path.join(INPUT_DIR, input_name)
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        if not os.path.exists(input_path):
            print(f"  SKIP {input_name} - not found")
            continue
        
        if os.path.exists(output_path):
            print(f"  SKIP {output_name} - already exists")
            continue
        
        try:
            tick_count = convert_file(input_path, output_path)
            total_ticks += tick_count
            converted += 1
        except Exception as e:
            print(f"FAILED: {e}")
    
    print("="*60)
    print(f"  Converted: {converted} files")
    print(f"  Total ticks: {total_ticks:,}")
    print("="*60)
    print("\n  ✅ EURUSD 2026 data is ready!")
    print("  Restart your server to load the data.\n")

if __name__ == "__main__":
    main()
