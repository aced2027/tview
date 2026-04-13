#!/usr/bin/env node

/**
 * Candle Generator Script
 * Generates OHLC candles from tick data for all pairs and timeframes
 * Saves candles as JSON for fast loading in the chart
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const PAIRS = [
  'AUDUSD', 'Eurusd', 'GBPUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'
];

const TIMEFRAMES = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000
};

const TICK_DATA_BASE = path.join(__dirname, '../2026');
const OUTPUT_DIR = path.join(__dirname, '../public/candles');

/**
 * Parse tick data line
 * Format: YYYYMMDD HHMMSSMMM,Bid,Ask,Flag
 */
function parseTickLine(line) {
  const parts = line.trim().split(',');
  if (parts.length < 3) return null;

  const [datetime, bid, ask] = parts;
  const bidPrice = parseFloat(bid);
  const askPrice = parseFloat(ask);

  if (isNaN(bidPrice) || isNaN(askPrice)) return null;

  // Parse datetime: YYYYMMDD HHMMSSMMM
  const dateStr = datetime.substring(0, 8);
  const timeStr = datetime.substring(9, 15);
  const msStr = datetime.substring(15, 18) || '000';

  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  const hours = parseInt(timeStr.substring(0, 2));
  const minutes = parseInt(timeStr.substring(2, 4));
  const seconds = parseInt(timeStr.substring(4, 6));
  const ms = parseInt(msStr);

  const timestamp = new Date(year, month - 1, day, hours, minutes, seconds, ms).getTime();
  const mid = (bidPrice + askPrice) / 2;

  return {
    timestamp,
    bid: bidPrice,
    ask: askPrice,
    mid
  };
}

/**
 * Read all tick files for a pair and month
 */
function readTickData(pair, month) {
  const monthStr = String(month).padStart(2, '0');
  const yearmonth = `2026${monthStr}`;
  const tickFolder = path.join(TICK_DATA_BASE, pair, `HISTDATA_COM_ASCII_${pair}_T${yearmonth}`);

  if (!fs.existsSync(tickFolder)) {
    console.log(`  ⚠ Folder not found: ${tickFolder}`);
    return [];
  }

  const csvFile = path.join(tickFolder, `DAT_ASCII_${pair}_T_${yearmonth}.csv`);
  if (!fs.existsSync(csvFile)) {
    console.log(`  ⚠ CSV file not found: ${csvFile}`);
    return [];
  }

  console.log(`  Reading: ${csvFile}`);

  const ticks = [];
  const content = fs.readFileSync(csvFile, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    const tick = parseTickLine(line);
    if (tick) {
      ticks.push(tick);
    }
  }

  console.log(`    → Loaded ${ticks.length} ticks`);
  return ticks;
}

/**
 * Save candles to JSON file efficiently
 */
function saveCandlesEfficiently(filename, candles) {
  // Write JSON manually to avoid stack overflow with large arrays
  let json = '[';
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    json += JSON.stringify(candle);
    if (i < candles.length - 1) {
      json += ',';
    }
    // Write in chunks to free memory
    if ((i + 1) % 10000 === 0) {
      fs.appendFileSync(filename, json);
      json = '';
    }
  }
  json += ']';
  fs.appendFileSync(filename, json);
}
function generateCandles(ticks, timeframeMs) {
  if (ticks.length === 0) return [];

  const candles = [];
  let currentCandle = null;

  // Sort ticks by timestamp
  ticks.sort((a, b) => a.timestamp - b.timestamp);

  for (const tick of ticks) {
    const candleTime = Math.floor(tick.timestamp / timeframeMs) * timeframeMs;

    if (!currentCandle || currentCandle.time !== candleTime) {
      if (currentCandle) {
        candles.push(currentCandle);
      }

      currentCandle = {
        time: Math.floor(candleTime / 1000), // Convert to seconds for lightweight-charts
        open: tick.mid,
        high: tick.mid,
        low: tick.mid,
        close: tick.mid,
        volume: 1
      };
    } else {
      currentCandle.high = Math.max(currentCandle.high, tick.mid);
      currentCandle.low = Math.min(currentCandle.low, tick.mid);
      currentCandle.close = tick.mid;
      currentCandle.volume += 1;
    }
  }

  if (currentCandle) {
    candles.push(currentCandle);
  }

  return candles;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Candle Generation...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }

  for (const pair of PAIRS) {
    console.log(`\n📊 Processing ${pair}...`);

    // Create pair directory
    const pairDir = path.join(OUTPUT_DIR, pair.toLowerCase());
    if (!fs.existsSync(pairDir)) {
      fs.mkdirSync(pairDir, { recursive: true });
    }

    // Initialize timeframe buckets for all months combined
    const timeframeBuckets = {};
    for (const timeframe of Object.keys(TIMEFRAMES)) {
      timeframeBuckets[timeframe] = {};
    }

    // Load and process each month
    for (let month = 1; month <= 4; month++) {
      const ticks = readTickData(pair, month);
      if (ticks.length === 0) continue;

      // Sort ticks
      ticks.sort((a, b) => a.timestamp - b.timestamp);

      // Build candles incrementally for each timeframe
      for (const [timeframe, timeframeMs] of Object.entries(TIMEFRAMES)) {
        for (const tick of ticks) {
          const candleTime = Math.floor(tick.timestamp / timeframeMs) * timeframeMs;
          const candleKey = candleTime;

          if (!timeframeBuckets[timeframe][candleKey]) {
            timeframeBuckets[timeframe][candleKey] = {
              time: Math.floor(candleTime / 1000),
              open: tick.mid,
              high: tick.mid,
              low: tick.mid,
              close: tick.mid,
              volume: 1
            };
          } else {
            const candle = timeframeBuckets[timeframe][candleKey];
            candle.high = Math.max(candle.high, tick.mid);
            candle.low = Math.min(candle.low, tick.mid);
            candle.close = tick.mid;
            candle.volume += 1;
          }
        }
      }
    }

    // Save candles for each timeframe
    for (const [timeframe, buckets] of Object.entries(timeframeBuckets)) {
      const candles = Object.values(buckets).sort((a, b) => a.time - b.time);
      if (candles.length === 0) continue;

      console.log(`  📈 Generating ${timeframe} candles...`);
      const filename = path.join(pairDir, `${timeframe}.json`);
      fs.writeFileSync(filename, '');
      saveCandlesEfficiently(filename, candles);
      console.log(`    ✓ Saved ${candles.length} candles to ${filename}`);
    }

    // Save metadata
    const metadataFile = path.join(pairDir, 'metadata.json');
    const metadata = {
      pair,
      generatedAt: new Date().toISOString(),
      status: 'ready'
    };
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  }

  console.log('\n\n✅ Candle generation complete!\n');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
