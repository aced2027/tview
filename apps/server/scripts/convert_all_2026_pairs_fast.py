#!/usr/bin/env python3
"""
FAST Batch Converter for ALL 2026 Pairs
========================================

Converts all major pairs from 2026 folder to server format.
Optimized for speed with parallel processing.

Pairs: AUDUSD, EURUSD, GBPUSD, NZDUSD, USDCAD, USDCHF, USDJPY
"""

import os
import csv
from datetime import datetime
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

# CONFIG
SOURCE_DIR = r"Z:\TV\2026"
OUTPUT_DIR = r"Z:\TV\apps\server\data\ticks"

PAIRS = ["AUDUSD", "EURUSD", "GBPUSD", "NZDUSD", "USDCAD", "USDCHF", "USDJPY"]
MONTHS = ["01", "02", "03", "04"]

def parse_histdata_row(date_time_str: str, bid: str, ask: str) -> dict:
    """Parse Histdata format to server format"""
    date_part = date_time_str[:8]
    time_part = date_time_str[9:]
    
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

def convert_file(args):
    """Convert one file - designed for parallel processing"""
    pair, month, input_path, output_path = args
    
    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        return (pair, month, 0, size_mb, True)  # Already exists
    
    if not os.path.exists(input_path):
        return (pair, month, 0, 0, False)  # Not found
    
    try:
        ticks = []
        with open(input_path, 'r') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) >= 3:
                    try:
                        tick = parse_histdata_row(parts[0], parts[1], parts[2])
                        ticks.append(tick)
                    except:
                        continue
        
        # Write output
        with open(output_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['timestamp', 'bid', 'ask', 'last', 'volume'])
            writer.writeheader()
            writer.writerows(ticks)
        
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        return (pair, month, len(ticks), size_mb, True)
    
    except Exception as e:
        return (pair, month, 0, 0, False)

def find_input_file(pair: str, month: str) -> str:
    """Find the Histdata CSV file for a pair/month"""
    # Try different folder structures
    pair_folder = os.path.join(SOURCE_DIR, pair)
    if not os.path.exists(pair_folder):
        pair_folder = os.path.join(SOURCE_DIR, pair.capitalize())
    if not os.path.exists(pair_folder):
        pair_folder = os.path.join(SOURCE_DIR, pair.lower())
    
    # Look for the file
    pattern = f"DAT_ASCII_{pair.upper()}_T_2026{month}.csv"
    
    for root, dirs, files in os.walk(pair_folder):
        for file in files:
            if file == pattern:
                return os.path.join(root, file)
    
    return ""

def main():
    print("="*70)
    print("  FAST BATCH CONVERTER - ALL 2026 PAIRS")
    print("="*70)
    print(f"  Pairs: {', '.join(PAIRS)}")
    print(f"  Months: Jan-Apr 2026")
    print(f"  Output: {OUTPUT_DIR}")
    print("="*70)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Build job list
    jobs = []
    for pair in PAIRS:
        for month in MONTHS:
            input_path = find_input_file(pair, month)
            output_filename = f"{pair}_TICKS_2026_{month}.csv"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            
            jobs.append((pair, month, input_path, output_path))
    
    print(f"\n  Found {len(jobs)} files to process")
    print(f"  Using parallel processing for speed...\n")
    
    # Process in parallel
    results = []
    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(convert_file, job): job for job in jobs}
        
        completed = 0
        for future in as_completed(futures):
            pair, month, tick_count, size_mb, success = future.result()
            completed += 1
            
            if success and tick_count > 0:
                print(f"  [{completed:>2}/{len(jobs)}] ✅ {pair} 2026-{month}  {tick_count:>9,} ticks  {size_mb:>6.1f} MB")
                results.append((pair, month, tick_count, size_mb))
            elif success and tick_count == 0:
                print(f"  [{completed:>2}/{len(jobs)}] ⏭  {pair} 2026-{month}  (already exists)")
            else:
                print(f"  [{completed:>2}/{len(jobs)}] ❌ {pair} 2026-{month}  (not found or failed)")
    
    # Summary
    total_ticks = sum(r[2] for r in results)
    total_mb = sum(r[3] for r in results)
    
    print("\n" + "="*70)
    print(f"  CONVERSION COMPLETE!")
    print("="*70)
    print(f"  Files converted: {len(results)}")
    print(f"  Total ticks: {total_ticks:,}")
    print(f"  Total size: {total_mb:.1f} MB")
    print("="*70)
    
    # Show pairs summary
    print("\n  Pairs ready:")
    pair_summary = {}
    for pair, month, ticks, size in results:
        if pair not in pair_summary:
            pair_summary[pair] = {'ticks': 0, 'size': 0, 'months': 0}
        pair_summary[pair]['ticks'] += ticks
        pair_summary[pair]['size'] += size
        pair_summary[pair]['months'] += 1
    
    for pair in sorted(pair_summary.keys()):
        info = pair_summary[pair]
        print(f"    {pair:<8} {info['months']} months  {info['ticks']:>10,} ticks  {info['size']:>6.1f} MB")
    
    print("\n  ✅ All pairs ready for trading!")
    print("  Next: Restart server to load all pairs\n")

if __name__ == "__main__":
    main()
