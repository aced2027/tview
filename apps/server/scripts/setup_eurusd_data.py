#!/usr/bin/env python3
"""
Complete EURUSD Data Setup
===========================

Downloads EURUSD tick data from Histdata and converts it to server format.

This script:
1. Downloads EURUSD Jan-Apr 2024 from Histdata.com
2. Converts to server-compatible CSV format
3. Cleans up intermediate files

Usage:
    python setup_eurusd_data.py
"""

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_script(script_name: str, description: str) -> bool:
    """Run a Python script and return success status."""
    print(f"\n{'='*60}")
    print(f"  {description}")
    print(f"{'='*60}\n")
    
    script_path = os.path.join(SCRIPT_DIR, script_name)
    
    if not os.path.exists(script_path):
        print(f"  ❌ Script not found: {script_path}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            cwd=SCRIPT_DIR,
            check=True,
            capture_output=False
        )
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Script failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("  EURUSD Data Setup - Complete Workflow")
    print("="*60)
    print("\n  This will:")
    print("  1. Download EURUSD tick data (Jan-Apr 2024)")
    print("  2. Convert to server format")
    print("  3. Make it ready for your chart")
    print("\n" + "="*60)
    
    response = input("\n  Continue? (y/n): ").strip().lower()
    if response != 'y':
        print("  Aborted.")
        return
    
    # Step 1: Download from Histdata
    success = run_script(
        "download_histdata.py",
        "Step 1: Downloading EURUSD from Histdata.com"
    )
    
    if not success:
        print("\n  ❌ Download failed. Please check the error above.")
        return
    
    # Step 2: Convert to server format
    success = run_script(
        "convert_histdata_to_server_format.py",
        "Step 2: Converting to server format"
    )
    
    if not success:
        print("\n  ❌ Conversion failed. Please check the error above.")
        return
    
    # Done!
    print("\n" + "="*60)
    print("  ✅ SETUP COMPLETE!")
    print("="*60)
    print("\n  Your EURUSD data is ready!")
    print("\n  Next steps:")
    print("  1. Restart your development server:")
    print("     cd Z:\\TV")
    print("     npm run dev")
    print("\n  2. Open http://localhost:5173 in your browser")
    print("  3. Select EURUSD from the watchlist")
    print("  4. The chart will display your tick data as candles")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
