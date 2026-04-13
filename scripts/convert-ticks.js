#!/usr/bin/env node

/**
 * Tick Data Converter
 * 
 * Converts various tick data formats to the required format for the trading terminal.
 * 
 * Usage:
 *   node scripts/convert-ticks.js input.csv EURUSD
 *   node scripts/convert-ticks.js input.json GBPUSD
 */

const fs = require('fs');
const path = require('path');

function convertCSV(inputFile, symbol) {
  console.log(`📖 Reading ${inputFile}...`);
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    console.error('❌ File is empty or has no data rows');
    process.exit(1);
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  console.log(`📋 Detected columns: ${header.join(', ')}`);

  // Map column names to indices
  const colMap = {
    timestamp: header.findIndex(h => ['timestamp', 't', 'time', 'date'].includes(h)),
    bid: header.findIndex(h => ['bid', 'b'].includes(h)),
    ask: header.findIndex(h => ['ask', 'a'].includes(h)),
    last: header.findIndex(h => ['last', 'l', 'price', 'close'].includes(h)),
    volume: header.findIndex(h => ['volume', 'v', 'vol'].includes(h))
  };

  console.log('🔍 Column mapping:', colMap);

  const ticks = [];
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    try {
      let timestamp = parseFloat(values[colMap.timestamp]);
      
      // Convert seconds to milliseconds if needed
      if (timestamp < 10000000000) {
        timestamp *= 1000;
      }

      let bid = colMap.bid >= 0 ? parseFloat(values[colMap.bid]) : null;
      let ask = colMap.ask >= 0 ? parseFloat(values[colMap.ask]) : null;
      let last = colMap.last >= 0 ? parseFloat(values[colMap.last]) : 0;
      let volume = colMap.volume >= 0 ? parseFloat(values[colMap.volume]) : 100;

      // If no bid/ask but have price, create spread
      if (!bid && !ask && last) {
        const spread = 0.00002;
        bid = last - spread / 2;
        ask = last + spread / 2;
      }

      // If no last but have bid/ask, use mid
      if (!last && bid && ask) {
        last = (bid + ask) / 2;
      }

      if (!timestamp || !bid || !ask) {
        errors++;
        continue;
      }

      ticks.push({ timestamp, bid, ask, last, volume });
    } catch (err) {
      errors++;
    }
  }

  console.log(`✅ Parsed ${ticks.length} ticks (${errors} errors)`);

  if (ticks.length === 0) {
    console.error('❌ No valid ticks found');
    process.exit(1);
  }

  // Sort by timestamp
  ticks.sort((a, b) => a.timestamp - b.timestamp);

  // Write output
  const outputDir = path.join(__dirname, '..', 'apps', 'server', 'data', 'ticks');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `${symbol}_ticks.csv`);
  const csv = [
    'timestamp,bid,ask,last,volume',
    ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
  ].join('\n');

  fs.writeFileSync(outputFile, csv);
  
  console.log(`\n🎉 Success!`);
  console.log(`📁 Output: ${outputFile}`);
  console.log(`📊 Ticks: ${ticks.length}`);
  console.log(`📅 Date range: ${new Date(ticks[0].timestamp).toISOString()} to ${new Date(ticks[ticks.length - 1].timestamp).toISOString()}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Start server: npm run dev:server`);
  console.log(`   2. Open browser: http://localhost:5173`);
  console.log(`   3. Select ${symbol} from watchlist`);
}

function convertJSON(inputFile, symbol) {
  console.log(`📖 Reading ${inputFile}...`);
  const content = fs.readFileSync(inputFile, 'utf-8');
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    console.error('❌ JSON must be an array of tick objects');
    process.exit(1);
  }

  console.log(`📊 Found ${data.length} records`);

  const ticks = [];
  let errors = 0;

  for (const item of data) {
    try {
      let timestamp = item.timestamp || item.t || item.time || item.date;
      
      if (timestamp < 10000000000) {
        timestamp *= 1000;
      }

      let bid = item.bid || item.b;
      let ask = item.ask || item.a;
      let last = item.last || item.l || item.price || item.close || 0;
      let volume = item.volume || item.v || item.vol || 100;

      if (!bid && !ask && last) {
        const spread = 0.00002;
        bid = last - spread / 2;
        ask = last + spread / 2;
      }

      if (!last && bid && ask) {
        last = (bid + ask) / 2;
      }

      if (!timestamp || !bid || !ask) {
        errors++;
        continue;
      }

      ticks.push({ timestamp, bid, ask, last, volume });
    } catch (err) {
      errors++;
    }
  }

  console.log(`✅ Parsed ${ticks.length} ticks (${errors} errors)`);

  if (ticks.length === 0) {
    console.error('❌ No valid ticks found');
    process.exit(1);
  }

  ticks.sort((a, b) => a.timestamp - b.timestamp);

  const outputDir = path.join(__dirname, '..', 'apps', 'server', 'data', 'ticks');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `${symbol}_ticks.csv`);
  const csv = [
    'timestamp,bid,ask,last,volume',
    ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
  ].join('\n');

  fs.writeFileSync(outputFile, csv);
  
  console.log(`\n🎉 Success!`);
  console.log(`📁 Output: ${outputFile}`);
  console.log(`📊 Ticks: ${ticks.length}`);
  console.log(`📅 Date range: ${new Date(ticks[0].timestamp).toISOString()} to ${new Date(ticks[ticks.length - 1].timestamp).toISOString()}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Start server: npm run dev:server`);
  console.log(`   2. Open browser: http://localhost:5173`);
  console.log(`   3. Select ${symbol} from watchlist`);
}

// Main
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Tick Data Converter

Usage:
  node scripts/convert-ticks.js <input-file> <symbol>

Examples:
  node scripts/convert-ticks.js my_data.csv EURUSD
  node scripts/convert-ticks.js my_data.json GBPUSD

Supported formats:
  - CSV with headers (timestamp, bid, ask, last, volume)
  - JSON array of tick objects

Symbol must be 6 letters (e.g., EURUSD, GBPUSD, USDJPY)
  `);
  process.exit(1);
}

const [inputFile, symbol] = args;

if (!fs.existsSync(inputFile)) {
  console.error(`❌ File not found: ${inputFile}`);
  process.exit(1);
}

if (symbol.length !== 6) {
  console.error(`❌ Symbol must be 6 letters (e.g., EURUSD, GBPUSD)`);
  process.exit(1);
}

const ext = path.extname(inputFile).toLowerCase();

if (ext === '.csv') {
  convertCSV(inputFile, symbol);
} else if (ext === '.json') {
  convertJSON(inputFile, symbol);
} else {
  console.error(`❌ Unsupported file format: ${ext}`);
  console.error(`   Supported: .csv, .json`);
  process.exit(1);
}
