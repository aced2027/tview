#!/usr/bin/env python3

import subprocess
import calendar
import sys
import os

# ── colours ──────────────────────────────────────────────────────────────────
C  = "\033[96m"   # cyan
G  = "\033[92m"   # green
Y  = "\033[93m"   # yellow
R  = "\033[91m"   # red
B  = "\033[94m"   # blue
W  = "\033[97m"   # white bold
RS = "\033[0m"    # reset

PAIRS = [
    "AUDUSD", "GBPUSD", "USDJPY", "USDCHF",
    "EURUSD", "USDCAD", "EURGBP", "EURJPY",
    "NZDUSD", "GBPJPY", "EURCHF", "AUDJPY",
]

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

def banner():
    print(f"""{C}╔══════════════════════════════════════════════════╗
║      DUKASCOPY TICK DATA DOWNLOADER  v2.0        ║
║      Ultra-Fast │ Month-by-Month │ Multi-Pair    ║
╚══════════════════════════════════════════════════╝{RS}""")

def pick_pairs():
    print(f"{W}─── SELECT PAIRS ─────────────────────────────────{RS}")
    for i, p in enumerate(PAIRS, 1):
        print(f"  {Y}{i:2}.{RS} {p}")
    print(f"\n  {Y} A.{RS} ALL pairs")
    print(f"\n{C}Enter numbers separated by commas  (e.g.  1,2,3){RS}")
    
    raw = input(f"{G}>> {RS}").strip()
    
    if raw.upper() == "A":
        print(f"{G}✔ Selected ALL {len(PAIRS)} pairs{RS}")
        return list(PAIRS)
    
    chosen = []
    for x in raw.split(","):
        x = x.strip()
        if x.isdigit() and 1 <= int(x) <= len(PAIRS):
            chosen.append(PAIRS[int(x)-1])
        else:
            print(f"{R}  Skipping invalid: {x}{RS}")
    
    if not chosen:
        print(f"{R}No valid pairs selected. Exiting.{RS}")
        sys.exit(1)
    
    print(f"{G}✔ Selected: {', '.join(chosen)}{RS}")
    return chosen

def pick_year():
    print(f"\n{W}─── SELECT YEAR ──────────────────────────────────{RS}")
    years = list(range(2024, 2009, -1))
    for i, y in enumerate(years, 1):
        print(f"  {Y}{i:2}.{RS} {y}")
    
    raw = input(f"{G}>> {RS}").strip()
    
    if raw.isdigit() and 1 <= int(raw) <= len(years):
        y = years[int(raw)-1]
        print(f"{G}✔ Year: {y}{RS}")
        return y
    
    # allow typing year directly
    if raw.isdigit() and 2010 <= int(raw) <= 2024:
        print(f"{G}✔ Year: {raw}{RS}")
        return int(raw)
    
    print(f"{R}Invalid year. Exiting.{RS}")
    sys.exit(1)

def pick_month(label, default):
    print(f"\n{W}─── SELECT {label} ─────────────────────────{RS}")
    for i, m in enumerate(MONTHS, 1):
        print(f"  {Y}{i:2}.{RS} {m}")
    
    raw = input(f"{G}>> [{default}] {RS}").strip()
    
    if raw == "":
        return default
    
    if raw.isdigit() and 1 <= int(raw) <= 12:
        print(f"{G}✔ {label}: {MONTHS[int(raw)-1]}{RS}")
        return int(raw)
    
    print(f"{R}Invalid month. Exiting.{RS}")
    sys.exit(1)

def confirm(pairs, year, sm, em):
    months = MONTHS[sm-1:em]
    print(f"""{C}╔══════════════════════════════════════════════════╗
║  DOWNLOAD SUMMARY                                ║
╠══════════════════════════════════════════════════╣{RS}
{C}║{RS}  Pairs  : {W}{', '.join(pairs)}{RS}
{C}║{RS}  Year   : {W}{year}{RS}
{C}║{RS}  Months : {W}{MONTHS[sm-1]} → {MONTHS[em-1]}{RS}
{C}║{RS}  Jobs   : {W}{len(pairs) * (em - sm + 1)} downloads{RS}
{C}╚══════════════════════════════════════════════════╝{RS}""")
    
    ans = input(f"{Y}Start download? (Y/n): {RS}").strip().lower()
    return ans in ("", "y", "yes")

def download(pairs, year, sm, em):
    # Change to data/ticks directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'data', 'ticks')
    os.makedirs(data_dir, exist_ok=True)
    os.chdir(data_dir)
    
    jobs = []
    for pair in pairs:
        for m in range(sm, em + 1):
            mm = f"{m:02d}"
            ld = calendar.monthrange(year, m)[1]
            frm = f"{year}-{mm}-01"
            to  = f"{year}-{mm}-{ld:02d}"
            jobs.append((pair, frm, to, mm))
    
    total = len(jobs)
    failed = []
    
    print(f"\n{C}Starting {total} downloads...{RS}\n")
    
    for i, (pair, frm, to, mm) in enumerate(jobs, 1):
        bar_filled = int((i-1) / total * 30)
        bar = "█" * bar_filled + "░" * (30 - bar_filled)
        pct = int((i-1) / total * 100)
        
        print(f"{B}[{bar}] {pct}%{RS}")
        print(f"{C}[{i}/{total}]{RS} {W}{pair}{RS}  {frm} → {to}")
        
        cmd = [
            "dukascopy-node",
            "-i", pair.lower(),
            "-from", frm,
            "-to", to,
            "-t", "tick",
            "-f", "csv",
            "--cache",
            "--batch-size", "20",
            "--retries", "5",
        ]
        
        result = subprocess.run(cmd, capture_output=False, shell=True)
        
        if result.returncode == 0:
            # rename file
            old_pat = f"{pair.lower()}-{frm}-{to}-tick.csv"
            new_name = f"{pair}_TICKS_{year}_{mm}.CSV"
            
            if os.path.exists(old_pat):
                os.rename(old_pat, new_name)
                size_mb = os.path.getsize(new_name) / (1024 * 1024)
                print(f"  {G}✔ Saved as {new_name} ({size_mb:.2f} MB){RS}\n")
            else:
                print(f"  {Y}⚠ File not found to rename — check folder{RS}\n")
        else:
            print(f"  {R}✘ FAILED: {pair} {frm}{RS}\n")
            failed.append(f"{pair} {frm}")
    
    print(f"\n{G}╔══════════════════════════════════════╗{RS}")
    print(f"{G}║  DONE!  {total - len(failed)}/{total} downloaded OK  ║{RS}")
    print(f"{G}╚══════════════════════════════════════╝{RS}")
    
    if failed:
        print(f"\n{R}Failed downloads:{RS}")
        for f in failed:
            print(f"  {R}• {f}{RS}")
    
    print(f"\n{C}Output directory: {os.getcwd()}{RS}")

def main():
    banner()
    
    pairs = pick_pairs()
    year  = pick_year()
    sm    = pick_month("START MONTH", 1)
    em    = pick_month("END MONTH", 12)
    
    if em < sm:
        print(f"{R}End month must be >= start month!{RS}")
        sys.exit(1)
    
    if confirm(pairs, year, sm, em):
        download(pairs, year, sm, em)
    else:
        print(f"{Y}Download cancelled.{RS}")

if __name__ == "__main__":
    main()
