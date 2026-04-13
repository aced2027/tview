#!/usr/bin/env python3
"""
Histdata.com Tick Data Downloader
==================================

Downloads tick data (ASCII format) for selected forex pairs,
years, and optional month range.

Usage:
    python download_histdata.py

Requirements:
    pip install requests beautifulsoup4
"""

import os
import time
import zipfile
import requests
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIGURATION — Edit these before running
# ─────────────────────────────────────────────

# All major forex pairs available on Histdata.com
ALL_PAIRS = [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF",
    "AUDUSD", "USDCAD", "NZDUSD",
    "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURCAD",
    "GBPJPY", "GBPCHF", "GBPAUD", "GBPCAD",
    "AUDJPY", "AUDCAD", "AUDCHF", "AUDNZD",
    "CADJPY", "CHFJPY", "NZDJPY",
]

# ── Select which pairs to download ──
# Set to ALL_PAIRS to download everything, or pick a subset:
PAIRS = ["EURUSD"]  # Download EURUSD

# ── Year range (inclusive) ──
START_YEAR = 2024
END_YEAR   = 2024

# ── Month range (1–12, inclusive) ──
# Set both to None to download all 12 months for each year
START_MONTH = 1
END_MONTH   = 4  # Jan-Apr

# ── Output directory ──
OUTPUT_DIR = r"Z:\TV\apps\server\data\ticks"

# ── Keep the downloaded .zip files? ──
KEEP_ZIP = False

# ── Seconds to wait between requests (be polite to the server) ──
DELAY = 2.0

# ─────────────────────────────────────────────
# DOWNLOADER — No need to edit below this line
# ─────────────────────────────────────────────

BASE_URL    = "https://www.histdata.com/download-free-forex-historical-data/?/ascii/tick-data-quotes"
REFERER     = "https://www.histdata.com/"
DOWNLOAD_EP = "https://www.histdata.com/get.php"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": REFERER,
})

def get_token(pair: str, year: int, month: int) -> str | None:
    """Fetch the hidden form token from the Histdata page."""
    url = f"{BASE_URL}/{pair.lower()}/{year}/{month}"
    
    try:
        r = SESSION.get(url, timeout=30)
        r.raise_for_status()
    except requests.RequestException as e:
        print(f"    [!] Page fetch failed: {e}")
        return None
    
    # Token is in a hidden <input name="tk"> field
    from html.parser import HTMLParser
    
    class TokenParser(HTMLParser):
        token = None
        def handle_starttag(self, tag, attrs):
            if tag == "input":
                d = dict(attrs)
                if d.get("name") == "tk":
                    self.token = d.get("value")
    
    p = TokenParser()
    p.feed(r.text)
    return p.token

def download_month(pair: str, year: int, month: int, out_dir: str) -> bool:
    """Download one month of tick data. Returns True on success."""
    label = f"{pair} {year}-{month:02d}"
    zip_name = f"HISTDATA_COM_ASCII_{pair}_{year}{month:02d}.zip"
    zip_path = os.path.join(out_dir, zip_name)
    
    # Skip if already extracted
    csv_check = os.path.join(out_dir, f"DAT_ASCII_{pair}_T_{year}{month:02d}.csv")
    if os.path.exists(csv_check):
        print(f"  [=] {label} already exists, skipping.")
        return True
    
    print(f"  [>] Downloading {label} ...", end=" ", flush=True)
    
    token = get_token(pair, year, month)
    if not token:
        print("SKIP (no token)")
        return False
    
    payload = {
        "tk":   token,
        "date": str(year),
        "datemonth": f"{month:02d}",
        "platform": "ASCII",
        "timeframe": "T",
        "fxpair": pair,
    }
    
    try:
        r = SESSION.post(DOWNLOAD_EP, data=payload, timeout=120, stream=True)
        r.raise_for_status()
        
        # Check if we got actual data (sometimes returns HTML error page)
        content_type = r.headers.get("Content-Type", "")
        
        # Save the file first, then check if it's valid
        with open(zip_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Check file size - if too small, probably an error page
        file_size = os.path.getsize(zip_path)
        if file_size < 1000:  # Less than 1KB is suspicious
            print(f"FAIL (file too small: {file_size} bytes)")
            os.remove(zip_path)
            return False
    
    except requests.RequestException as e:
        print(f"FAIL ({e})")
        if os.path.exists(zip_path):
            os.remove(zip_path)
        return False
    
    # Unzip
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(out_dir)
        print("OK")
    except zipfile.BadZipFile:
        print("FAIL (bad zip)")
        os.remove(zip_path)
        return False
    
    if not KEEP_ZIP and os.path.exists(zip_path):
        os.remove(zip_path)
    
    return True

def validate_config():
    now = datetime.now()
    
    if START_YEAR > END_YEAR:
        raise ValueError("START_YEAR must be <= END_YEAR")
    
    if not (1 <= START_MONTH <= 12) or not (1 <= END_MONTH <= 12):
        raise ValueError("Months must be between 1 and 12")
    
    if START_MONTH > END_MONTH and START_YEAR == END_YEAR:
        raise ValueError("START_MONTH > END_MONTH within the same year")
    
    if START_YEAR < 2000 or END_YEAR > now.year:
        raise ValueError(f"Years must be between 2000 and {now.year}")
    
    if not PAIRS:
        raise ValueError("PAIRS list is empty")

def main():
    validate_config()
    
    print("=" * 55)
    print("  Histdata.com Tick Data Downloader")
    print("=" * 55)
    print(f"  Pairs   : {len(PAIRS)} selected ({', '.join(PAIRS)})")
    print(f"  Years   : {START_YEAR} – {END_YEAR}")
    print(f"  Months  : {START_MONTH:02d} – {END_MONTH:02d}")
    print(f"  Output  : {os.path.abspath(OUTPUT_DIR)}")
    print("=" * 55)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    years  = range(START_YEAR, END_YEAR + 1)
    months = range(START_MONTH, END_MONTH + 1)
    total = len(PAIRS) * len(years) * len(months)
    done  = 0
    fails = []
    
    for pair in PAIRS:
        print(f"\n[{pair}]")
        
        for year in years:
            for month in months:
                ok = download_month(pair, year, month, OUTPUT_DIR)
                done += 1
                
                if not ok:
                    fails.append(f"{pair} {year}-{month:02d}")
                
                if done < total:
                    time.sleep(DELAY)
    
    print("\n" + "=" * 55)
    print(f"  Finished: {done - len(fails)}/{total} succeeded")
    
    if fails:
        print(f"  Failed ({len(fails)}):")
        for f in fails:
            print(f"    - {f}")
    else:
        print("  All downloads completed successfully!")
    
    print("=" * 55)
    print(f"\n  Files saved to: {OUTPUT_DIR}")
    print("  Next step: Restart your server to load the data\n")

if __name__ == "__main__":
    main()
