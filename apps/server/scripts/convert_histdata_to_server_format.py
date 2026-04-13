#!/usr/bin/env python3
"""
Convert Histdata CSV to Server Format
======================================

Converts Histdata.com tick data CSV files to the format expected by the server.

Histdata format:
    Date,Time,Bid,Ask,Volume
    20240101,000000123,1.10234,1.10245,100

Server format:
    timestamp,bid,ask,last,volume
    1704067200123,1.10234,1.10245,1.10239,100

Usage:
    python convert_histdata_to_server_format.py
"""

import os
import csv
from datetime import datetime
from pathlib import Path

# CONFIG
INPUT_DIR = r"Z:\TV\apps\server\data\ticks"
OUTPUT_DIR = r"Z:\TV\apps\server\data\ticks"

def parse_histdata_datetime(date_str: str, time_str: str) -> int:
    """
    Convert Histdata date/time to Unix timestamp in milliseconds.
    
    Date format: YYYYMMDD (e.g., 20240101)
    Time format: HHMMSSmmm (e.g., 000000123 = 00:00:00.123)
    """
    # Parse date
    year = int(date_str[0:4])
    month = int(date_str[4:6])
    day = int(date_str[6:8])
    
    # Parse time
    hour = int(time_str[0:2])
    minute = int(time_str[2:4])
    second = int(time_str[4:6])
    millisecond = int(time_str[6:9]) if len(time_str) >= 9 else 0
    
    # Create datetime and convert to timestamp
    dt = datetime(year, month, day, hour, minute, second, millisecond * 1000)
    timestamp_ms = int(dt.timestamp() * 1000)
    
    return timestamp_ms

def convert_file(input_path: str, output_path: str) -> tuple[int, bool]:
    """
    Convert a single Histdata CSV file to server format.
    Returns (tick_count, success)
    """
    try:
        with open(input_path, 'r') as infile:
            reader = csv.DictReader(infile, fieldnames=['Date', 'Time', 'Bid', 'Ask', 'Volume'])
            
            # Skip header if present
            first_row = next(reader)
            if first_row['Date'].lower() == 'date':
                pass  # Header row, already skipped
            else:
                # Not a header, need to process it
                reader = csv.DictReader(open(input_path, 'r'), 
                                       fieldnames=['Date', 'Time', 'Bid', 'Ask', 'Volume'])
            
            ticks = []
            for row in reader:
                try:
                    timestamp = parse_histdata_datetime(row['Date'], row['Time'])
                    bid = float(row['Bid'])
                    ask = float(row['Ask'])
                    last = (bid + ask) / 2  # Mid price
                    volume = float(row['Volume']) if row['Volume'] else 0
                    
                    ticks.append({
                        'timestamp': timestamp,
                        'bid': bid,
                        'ask': ask,
                        'last': last,
                        'volume': volume
                    })
                except (ValueError, KeyError) as e:
                    continue  # Skip malformed rows
            
            if not ticks:
                return 0, False
            
            # Write to output
            with open(output_path, 'w', newline='') as outfile:
                writer = csv.DictWriter(outfile, 
                                       fieldnames=['timestamp', 'bid', 'ask', 'last', 'volume'])
                writer.writeheader()
                writer.writerows(ticks)
            
            return len(ticks), True
    
    except Exception as e:
        print(f"  Error: {e}")
        return 0, False

def extract_symbol_and_date(filename: str) -> tuple[str, str] | None:
    """
    Extract symbol and date from Histdata filename.
    
    Examples:
        DAT_ASCII_EURUSD_T_202401.csv -> (EURUSD, 2024_01)
        HISTDATA_COM_ASCII_GBPUSD_202402.csv -> (GBPUSD, 2024_02)
    """
    # Remove extension
    name = filename.replace('.csv', '').replace('.CSV', '')
    
    # Try different patterns
    parts = name.split('_')
    
    # Pattern 1: DAT_ASCII_EURUSD_T_202401
    if 'ASCII' in parts:
        for i, part in enumerate(parts):
            if len(part) == 6 and part.isalpha():  # Symbol (e.g., EURUSD)
                symbol = part
                # Look for date in next parts
                for j in range(i+1, len(parts)):
                    if len(parts[j]) == 6 and parts[j].isdigit():  # YYYYMM
                        year_month = f"{parts[j][:4]}_{parts[j][4:6]}"
                        return symbol, year_month
    
    return None

def main():
    print("=" * 60)
    print("  Histdata → Server Format Converter")
    print("=" * 60)
    print(f"  Input:  {INPUT_DIR}")
    print(f"  Output: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Find all Histdata CSV files
    histdata_files = []
    for file in os.listdir(INPUT_DIR):
        if file.startswith('DAT_ASCII_') and file.endswith('.csv'):
            histdata_files.append(file)
    
    if not histdata_files:
        print("\n  No Histdata CSV files found!")
        print("  Looking for files like: DAT_ASCII_EURUSD_T_202401.csv")
        return
    
    print(f"\n  Found {len(histdata_files)} Histdata files\n")
    
    converted = 0
    failed = 0
    total_ticks = 0
    
    for filename in sorted(histdata_files):
        result = extract_symbol_and_date(filename)
        if not result:
            print(f"  [SKIP] {filename} - cannot parse filename")
            failed += 1
            continue
        
        symbol, year_month = result
        
        input_path = os.path.join(INPUT_DIR, filename)
        output_filename = f"{symbol}_TICKS_{year_month}.csv"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        # Skip if already exists
        if os.path.exists(output_path):
            print(f"  [EXISTS] {output_filename}")
            continue
        
        print(f"  [CONVERT] {filename} → {output_filename} ...", end=" ")
        
        tick_count, success = convert_file(input_path, output_path)
        
        if success:
            size_kb = os.path.getsize(output_path) / 1024
            print(f"OK ({tick_count:,} ticks, {size_kb:.1f} KB)")
            converted += 1
            total_ticks += tick_count
        else:
            print("FAILED")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"  Converted: {converted} files")
    print(f"  Failed: {failed} files")
    print(f"  Total ticks: {total_ticks:,}")
    print("=" * 60)
    
    if converted > 0:
        print("\n  ✅ Conversion complete!")
        print("  Next step: Restart your server to load the new data\n")

if __name__ == "__main__":
    main()
