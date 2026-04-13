#!/usr/bin/env python3
"""
convert_bi5_to_csv.py

Converts Dukascopy .bi5 binary tick files to CSV.

Usage:
    python convert_bi5_to_csv.py

Requirements:
    pip install lzma struct pandas tqdm
    (lzma and struct are built-in to Python 3)

.bi5 format (Dukascopy tick data):
Each record = 20 bytes:
- 4 bytes: milliseconds offset from hour start (big-endian uint32)
- 4 bytes: ask price * 100000 (big-endian uint32)
- 4 bytes: bid price * 100000 (big-endian uint32)
- 4 bytes: ask volume (big-endian float32)
- 4 bytes: bid volume (big-endian float32)
"""

import os
import struct
import lzma
import csv
from datetime import datetime, timezone
import glob
from pathlib import Path

# ── CONFIG ─────────────────────────────────────────────────────────────────────
CACHE_DIR   = r"Z:\TV\apps\server\data\ticks\.dukascopy-cache"   # where .bi5 files are
OUTPUT_DIR  = r"Z:\TV\apps\server\data\ticks"                     # where CSVs will go
INSTRUMENT  = "AUDUSD"
PRICE_SCALE = 100_000   # Dukascopy stores price * 100000

# ───────────────────────────────────────────────────────────────────────────────

def decode_bi5(filepath: str, hour_dt: datetime) -> list[dict]:
    """Decompress and decode a single .bi5 file into a list of tick dicts."""
    try:
        with open(filepath, "rb") as f:
            raw = f.read()
        
        if len(raw) == 0:
            return []
        
        # Decompress LZMA
        decompressed = lzma.decompress(raw)
        record_size = 20
        n_records = len(decompressed) // record_size
        
        ticks = []
        hour_ts_ms = int(hour_dt.replace(tzinfo=timezone.utc).timestamp() * 1000)
        
        for i in range(n_records):
            offset = i * record_size
            chunk  = decompressed[offset : offset + record_size]
            
            ms_offset, ask_raw, bid_raw, ask_vol, bid_vol = struct.unpack(">IIIff", chunk)
            
            timestamp_ms = hour_ts_ms + ms_offset
            ask = ask_raw / PRICE_SCALE
            bid = bid_raw / PRICE_SCALE
            
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
        print(f"  ⚠  Error reading {filepath}: {e}")
        return []

def parse_bi5_path(filepath: str):
    """Extract datetime from path like:
    .../AUDUSD/2024/00/01/00h_ticks.bi5
    
    Returns (datetime, year, month_str, day_str) or None.
    """
    p = Path(filepath)
    
    # parts[-1] = '00h_ticks.bi5'  hour from filename
    # parts[-2] = '01' (day, 0-indexed in Dukascopy = day-1, but actually it IS day)
    # parts[-3] = '00' (month, 0-indexed!)
    # parts[-4] = '2024' (year)
    
    try:
        hour_str  = p.stem.replace("h_ticks", "").replace("h_BID_ticks", "")
        day_str   = p.parent.name          # e.g. '00' = day 1
        month_str = p.parent.parent.name   # e.g. '00' = January
        year_str  = p.parent.parent.parent.name
        
        year  = int(year_str)
        month = int(month_str) + 1   # Dukascopy months are 0-indexed!
        day   = int(day_str)   + 1   # Dukascopy days   are 0-indexed!
        hour  = int(hour_str)
        
        dt = datetime(year, month, day, hour)
        return dt
    
    except Exception as e:
        print(f"  ⚠  Cannot parse path {filepath}: {e}")
        return None

def find_bi5_files(cache_dir: str, instrument: str) -> list[str]:
    """Find all .bi5 files for the given instrument."""
    # Try both upper and lowercase instrument folder names
    patterns = [
        os.path.join(cache_dir, instrument.upper(), "**", "*.bi5"),
        os.path.join(cache_dir, instrument.lower(), "**", "*.bi5"),
        os.path.join(cache_dir, "**", "*.bi5"),   # fallback: search everything
    ]
    
    files = []
    for pat in patterns:
        found = glob.glob(pat, recursive=True)
        if found:
            print(f"  Found {len(found)} .bi5 files with pattern: {pat}")
            files = found
            break
    
    return sorted(files)

def convert_all(cache_dir: str, output_dir: str, instrument: str):
    """Main conversion: reads all .bi5 files and writes monthly CSVs."""
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  Dukascopy .bi5 → CSV Converter")
    print(f"  Instrument : {instrument}")
    print(f"  Cache dir  : {cache_dir}")
    print(f"  Output dir : {output_dir}")
    print(f"{'='*60}\n")
    
    files = find_bi5_files(cache_dir, instrument)
    
    if not files:
        print("❌  No .bi5 files found! Check your CACHE_DIR and INSTRUMENT settings.")
        return
    
    print(f"📂  Found {len(files)} .bi5 files. Starting conversion...\n")
    
    # Group ticks by YYYY-MM for monthly CSV files
    monthly_data: dict[str, list[dict]] = {}
    
    for i, fpath in enumerate(files, 1):
        dt = parse_bi5_path(fpath)
        if dt is None:
            continue
        
        month_key = dt.strftime("%Y_%m")  # e.g. '2024_01'
        ticks = decode_bi5(fpath, dt)
        
        if ticks:
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            monthly_data[month_key].extend(ticks)
        
        # Progress indicator
        if i % 100 == 0 or i == len(files):
            total_ticks = sum(len(v) for v in monthly_data.values())
            print(f"  [{i:>4}/{len(files)}] processed ... {total_ticks:,} ticks so far")
    
    print(f"\n✅  Decoded {sum(len(v) for v in monthly_data.values()):,} total ticks")
    print(f"📅  Months found: {sorted(monthly_data.keys())}\n")
    
    # Write one CSV per month
    for month_key, ticks in sorted(monthly_data.items()):
        # Sort by timestamp
        ticks.sort(key=lambda x: x["timestamp_ms"])
        
        out_filename = f"{instrument}_TICKS_{month_key}.csv"
        out_path = os.path.join(output_dir, out_filename)
        
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["timestamp_ms", "datetime_utc", "ask", "bid", "ask_volume", "bid_volume"])
            writer.writeheader()
            writer.writerows(ticks)
        
        size_kb = os.path.getsize(out_path) / 1024
        print(f"  ✅  {out_filename}  →  {len(ticks):,} ticks  ({size_kb:.1f} KB)")
    
    print(f"\n🎉  Done! CSVs saved to: {output_dir}")

# ── DIAGNOSTIC MODE: show what's in the cache ─────────────────────────────────

def diagnose_cache(cache_dir: str):
    """Print a summary of what's in the cache directory."""
    print(f"\n{'='*60}")
    print(f"  CACHE DIAGNOSIS: {cache_dir}")
    print(f"{'='*60}")
    
    if not os.path.exists(cache_dir):
        print(f"❌  Cache directory does not exist: {cache_dir}")
        return
    
    all_bi5 = glob.glob(os.path.join(cache_dir, "**", "*.bi5"), recursive=True)
    print(f"  Total .bi5 files : {len(all_bi5)}")
    
    if not all_bi5:
        print("  No .bi5 files found.")
        return
    
    # Show first few
    print(f"\n  First 5 files:")
    for f in all_bi5[:5]:
        size = os.path.getsize(f)
        print(f"    {f}  ({size} bytes)")
    
    # Show folder structure
    subdirs = set()
    for f in all_bi5:
        rel = os.path.relpath(f, cache_dir)
        parts = rel.split(os.sep)
        if len(parts) >= 1:
            subdirs.add(parts[0])
    
    print(f"\n  Top-level folders in cache: {sorted(subdirs)}")

# ── ENTRY POINT ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Step 1: Diagnose what's in cache
    diagnose_cache(CACHE_DIR)
    
    # Step 2: Convert everything
    print()
    response = input("Proceed with conversion? (y/n): ").strip().lower()
    if response == "y":
        convert_all(CACHE_DIR, OUTPUT_DIR, INSTRUMENT)
    else:
        print("Aborted.")
