#!/usr/bin/env node

/**
 * Generate realistic tick data for testing
 */

const fs = require('fs');
const path = require('path');

function generateTicks(symbol, startPrice, count, durationMinutes) {
  const ticks = [];
  const startTime = Date.now() - (durationMinutes * 60 * 1000);
  const interval = (durationMinutes * 60 * 1000) / count;
  
  let price = startPrice;
  const spread = 0.00002; // 0.2 pips
  
  for (let i = 0; i < count; i++) {
    // Random walk with trend
    const change = (Math.random() - 0.48) * 0.0001; // Slight upward bias
    price += change;
    
    // Add some volatility spikes
    if (Math.random() > 0.95) {
      price += (Math.random() - 0.5) * 0.001;
    }
    
    const timestamp = Math.floor(startTime + (i * interval));
    const bid = price;
    const ask = price + spread;
    const last = (bid + ask) / 2;
    const volume = Math.floor(Math.random() * 200) + 50;
    
    ticks.push({
      timestamp,
      bid: bid.toFixed(5),
      ask: ask.toFixed(5),
      last: last.toFixed(5),
      volume
    });
  }
  
  return ticks;
}

// Generate data for multiple symbols
const symbols = [
  { name: 'EURUSD', startPrice: 1.08450, count: 5000, duration: 240 }, // 4 hours
  { name: 'GBPUSD', startPrice: 1.25450, count: 5000, duration: 240 },
  { name: 'USDJPY', startPrice: 149.850, count: 5000, duration: 240 },
  { name: 'AUDUSD', startPrice: 0.65320, count: 5000, duration: 240 },
];

const outputDir = path.join(__dirname, '..', 'apps', 'server', 'data', 'ticks');

for (const symbol of symbols) {
  console.log(`Generating ${symbol.count} ticks for ${symbol.name}...`);
  
  const ticks = generateTicks(symbol.name, symbol.startPrice, symbol.count, symbol.duration);
  
  const csv = [
    'timestamp,bid,ask,last,volume',
    ...ticks.map(t => `${t.timestamp},${t.bid},${t.ask},${t.last},${t.volume}`)
  ].join('\n');
  
  const filename = path.join(outputDir, `${symbol.name}_ticks.csv`);
  fs.writeFileSync(filename, csv);
  
  console.log(`✅ Created ${filename}`);
  console.log(`   ${ticks.length} ticks over ${symbol.duration} minutes`);
  console.log(`   Price range: ${Math.min(...ticks.map(t => parseFloat(t.bid))).toFixed(5)} - ${Math.max(...ticks.map(t => parseFloat(t.bid))).toFixed(5)}`);
}

console.log('\n🎉 Sample data generation complete!');
console.log('Restart the server to load the new data.');
