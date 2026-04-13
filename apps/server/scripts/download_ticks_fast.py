#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════╗
║   DUKASCOPY TICK DOWNLOADER  v5.0               ║
║   Month-by-Month │ Parallel │ 2010–2026         ║
╚══════════════════════════════════════════════════╝

Save this to: Z:\\TV\\apps\\server\\scripts\\
Run:  python download_ticks_fast.py
"""

import subprocess
import os
import calendar
import time
import glob
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ─────────────────────────────────────────────
#  CONFIG — change only OUTPUT_DIR if needed
# ─────────────────────────────────────────────
OUTPUT_DIR  = r"Z:\TV\apps\server\data\ticks"
BATCH_SIZE  = 10        # dukascopy default is 10 — safe value
BATCH_PAUSE = 500       # ms between batches
RETRIES     = 5
RETRY_PAUSE = 1000      # ms between retries

# ─────────────────────────────────────────────
PAIRS = [
    "AUDUSD", "GBPUSD", "USDJPY", "USDCHF",
    "EURUSD", "USDCAD", "EURGBP", "EURJPY",
    "NZDUSD", "GBPJPY", "EURCHF", "AUDJPY",
]

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

CURRENT_YEAR  = datetime.now().year
CURRENT_MONTH = datetime.now().month
YEARS = list(range(2010, CURRENT_YEAR + 1))

print_lock = Lock()

def cprint(msg, color="white"):
    codes = {
        "cyan":    "\033[96m",
        "green":   "\033[92m",
        "yellow":  "\033[93m",
        "red":     "\033[91m",
        "white":   "\033[97m",
    }
    with print_lock:
        print(f"{codes.get(color,'')}{msg}\033[0m", flush=True)

def build_cmd(pair, frm, to, out_file):
    # ✅ VERIFIED FLAGS from: dukascopy-node --help
    # -i               instrument (lowercase)
    # -from            date-from
    # -to              date-to
    # -t               timeframe
    # -f               format
    # -v               include volumes
    # --cache          use cache
    # --retries        retry count
    # --retry-pause    ms between retries
    # --retry-on-empty retry on 0-byte response  ← FIXES EMPTY FILES
    # --batch-size     artifacts per batch
    # --batch-pause    ms between batches
    # --directory      output folder
    # --file-name      custom output filename     ← saves directly as our name
    #
    # ❌ DOES NOT EXIST in this version:
    #    --no-progress, --quiet, --silent (use -s instead), --dir
    
    return (
        f'dukascopy-node'
        f' -i {pair.lower()}'
        f' -from {frm}'
        f' -to {to}'
        f' -t tick'
        f' -f csv'
        f' -v'
        f' --cache'
        f' --retries {RETRIES}'
        f' --retry-pause {RETRY_PAUSE}'
        f' --retry-on-empty'
        f' --batch-size {BATCH_SIZE}'
        f' --batch-pause {BATCH_PAUSE}'
        f' --directory "{os.path.dirname(out_file)}"'
        f' --file-name "{os.path.basename(out_file)}"'
        f' -s'
    )

def menu_pairs():
    print("\n\033[1m─── SELECT PAIRS ─────────────────────────────────\033[0m")
    for i, p in enumerate(PAIRS, 1):
        print(f"  {i:>2}. {p}")
    print("\n   A. ALL pairs\n")
    
    raw = input("Enter numbers (e.g. 1,2,3)  or A for all >> ").strip().upper()
    if raw == "A":
        return PAIRS[:]
    
    selected = []
    for part in raw.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-")
            selected += [PAIRS[i-1] for i in range(int(a), int(b)+1)]
        elif part.isdigit():
            selected.append(PAIRS[int(part)-1])
    return selected

def menu_years():
    print("\n\033[1m─── SELECT YEAR RANGE ────────────────────────────\033[0m")
    for i, y in enumerate(YEARS, 1):
        tag = " ◄ CURRENT" if y == CURRENT_YEAR else ""
        print(f"  {i:>2}. {y}{tag}")
    print()
    
    s = max(1, min(int(input(f"  Start year [1-{len(YEARS)}] >> ").strip()), len(YEARS))) - 1
    e = max(1, min(int(input(f"  End   year [1-{len(YEARS)}] >> ").strip()), len(YEARS))) - 1
    return YEARS[s], YEARS[e]

def menu_months(label):
    print(f"\n\033[1m─── {label} ──────────────────────────────────\033[0m")
    for i, m in enumerate(MONTHS, 1):
        print(f"  {i:>2}. {m}")
    print()
    return max(1, min(int(input("  Enter [1-12] >> ").strip()), 12))

def menu_speed():
    print("\n\033[1m─── SELECT DOWNLOAD SPEED ────────────────────────\033[0m")
    print("   1. Safe     (4 workers  — stable)")
    print("   2. Fast     (8 workers  — recommended)")
    print("   3. Turbo    (12 workers — aggressive)")
    print("   4. Insane   (16 workers — fastest)\n")
    return {"1":4, "2":8, "3":12, "4":16}.get(input("  Select [1-4] >> ").strip(), 8)

def download_one(pair, year, month, job_id, total):
    mm  = str(month).zfill(2)
    ld  = calendar.monthrange(year, month)[1]
    frm = f"{year}-{mm}-01"
    to  = f"{year}-{mm}-{ld}"
    out_file = os.path.join(OUTPUT_DIR, f"{pair}_TICKS_{year}_{mm}.csv")
    
    # Skip already downloaded and non-empty files
    if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
        cprint(f"[{job_id:>4}/{total}] ⏭  {pair} {year}-{mm}  EXISTS ({round(os.path.getsize(out_file)/1024,1)} KB)", "yellow")
        return True, pair, year, mm
    
    # Remove empty/broken previous attempts
    if os.path.exists(out_file):
        os.remove(out_file)
    
    cmd = build_cmd(pair, frm, to, out_file)
    cprint(f"[{job_id:>4}/{total}] ▶  {pair}  {frm} → {to}", "cyan")
    t0 = time.time()
    
    try:
        result = subprocess.run(cmd, shell=True,
                               capture_output=True, text=True,
                               timeout=600   # 10 min max per job
        )
        elapsed = round(time.time() - t0, 1)
        stdout  = (result.stdout or "").strip()
        stderr  = (result.stderr or "").strip()
        
        # Check if file was created and has data
        if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
            size_kb = round(os.path.getsize(out_file) / 1024, 1)
            cprint(f"[{job_id:>4}/{total}] ✔  {pair} {year}-{mm}  {size_kb} KB  ({elapsed}s)", "green")
            return True, pair, year, mm
        
        # File missing or 0 bytes — show full output for diagnosis
        cprint(f"[{job_id:>4}/{total}] ✘  {pair} {year}-{mm}  FAILED ({elapsed}s)", "red")
        if "fetch failed" in stdout or "fetch failed" in stderr:
            cprint(f"         → Network error / data not available for this date", "yellow")
        elif stdout:
            cprint(f"         stdout: {stdout[:200]}", "yellow")
        if stderr:
            cprint(f"         stderr: {stderr[:200]}", "red")
        
        return False, pair, year, mm
    
    except subprocess.TimeoutExpired:
        cprint(f"[{job_id:>4}/{total}] ⏱  {pair} {year}-{mm}  TIMEOUT", "red")
        return False, pair, year, mm
    except Exception as ex:
        cprint(f"[{job_id:>4}/{total}] ✘  {pair} {year}-{mm}  ERROR: {ex}", "red")
        return False, pair, year, mm

def run_pool(jobs, workers):
    total  = len(jobs)
    failed = []
    done   = 0
    
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(download_one, p, y, m, i+1, total): (p, y, m)
                   for i, (p, y, m) in enumerate(jobs)}
        
        for f in as_completed(futures):
            ok, pair, year, mm = f.result()
            done += 1
            if not ok:
                failed.append((pair, year, mm))
            
            pct = int(done / total * 40)
            bar = "█" * pct + "░" * (40 - pct)
            with print_lock:
                print(f"\r  [{bar}] {done}/{total}  ({len(failed)} failed)", end="", flush=True)
    
    print()
    return failed

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("\n\033[1m\033[96m" + "═"*56)
    print(f"   DUKASCOPY TICK DOWNLOADER  v5.0  (verified flags)")
    print(f"   Month-by-Month │ Parallel │ 2010–{CURRENT_YEAR}")
    print("═"*56 + "\033[0m\n")
    
    # Show the exact command that will be used so user can verify
    sample = build_cmd("AUDUSD", "2026-03-01", "2026-03-31",
                      r"Z:\TV\apps\server\data\ticks\AUDUSD_TICKS_2026_03.csv")
    print(f"  \033[93mCommand format:\033[0m")
    print(f"  {sample}\n")
    
    pairs          = menu_pairs()
    y_start, y_end = menu_years()
    m_start        = menu_months("SELECT START MONTH")
    m_end          = menu_months("SELECT END MONTH  ")
    workers        = menu_speed()
    
    # Build job list — never schedule future months
    jobs = []
    for year in range(y_start, y_end + 1):
        ms = m_start if year == y_start else 1
        me = m_end   if year == y_end   else 12
        
        if year == CURRENT_YEAR:
            # only months already completed (not the current partial month)
            me = min(me, CURRENT_MONTH - 1)
        
        for month in range(ms, me + 1):
            for pair in pairs:
                jobs.append((pair, year, month))
    
    if not jobs:
        cprint("\n  No valid jobs! Check your date range.", "red")
        cprint(f"  Note: current month ({MONTHS[CURRENT_MONTH-1]} {CURRENT_YEAR}) is excluded as it's incomplete.", "yellow")
        return
    
    total   = len(jobs)
    y_range = f"{y_start}" if y_start == y_end else f"{y_start}–{y_end}"
    ps      = ', '.join(pairs)
    if len(ps) > 38: ps = ps[:35] + '...'
    
    print(f"""
\033[1m╔{'═'*54}╗
║  DOWNLOAD SUMMARY{' '*36}║
╠{'═'*54}╣
║  Pairs   : {ps:<42}║
║  Years   : {y_range:<42}║
║  Months  : {MONTHS[m_start-1]} → {MONTHS[m_end-1]:<36}║
║  Total   : {str(total)+' downloads':<42}║
║  Workers : {str(workers)+' parallel':<42}║
╚{'═'*54}╝\033[0m""")
    
    est = max(1, round(total * 2.0 / workers))
    print(f"\n  Estimated time: ~{est} min")
    
    if input("\n  Start? (Y/n): ").strip().upper() == "N":
        print("Aborted."); return
    
    print(f"\n  Downloading...\n")
    
    t0     = time.time()
    failed = run_pool(jobs, workers)
    mins, secs = divmod(round(time.time() - t0), 60)
    succeeded  = total - len(failed)
    
    print(f"\n\033[93m{'═'*56}")
    print(f"  DONE!  {succeeded}/{total} succeeded  │  {mins}m {secs}s")
    print(f"{'═'*56}\033[0m")
    
    if failed:
        print(f"\n\033[91m  {len(failed)} failed:\033[0m")
        for p, y, m in failed:
            print(f"    ✘  {p}  {y}-{m}")
        
        if input("\n  Retry failed? (Y/n): ").strip().upper() != "N":
            failed2 = run_pool([(p, y, int(m)) for p, y, m in failed], workers)
            if failed2:
                print(f"\n\033[91m  Still failed after retry:\033[0m")
                for p, y, m in failed2:
                    print(f"    ✘  {p}  {y}-{m}")
            else:
                cprint("  All retries succeeded!", "green")
    
    print(f"\n  Output: {OUTPUT_DIR}")
    cprint("  ✔ Restart your server to load the new tick data.\n", "green")

if __name__ == "__main__":
    main()
