#!/usr/bin/env node

/**
 * Fast Dukascopy Tick Data Downloader (ES Module)
 * Downloads tick data month-by-month with parallel processing
 * 
 * Usage:
 *   node download-ticks.js AUDUSD 2024
 *   node download-ticks.js GBPUSD 2024 --months=1,2,3
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SYMBOLS = ['AUDUSD', 'GBPUSD', 'USDJPY', 'USDCHF'];
const YEAR = 2024;
const OUTPUT_DIR = path.join(__dirname, '../data/ticks');
const BATCH_SIZE = 30;
const RETRIES = 5;

// Parse command line arguments
const args = process.argv.slice(2);
const symbol = args[0] || null;
const year = args[1] ? parseInt(args[1]) : YEAR;
const monthsArg = args.find(arg => arg.startsWith('--months='));
const selectedMonths = monthsArg 
  ? monthsArg.split('=')[1].split(',').map(m => parseInt(m))
  : Array.from({ length: 12 }, (_, i) => i + 1);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if dukascopy-node is installed
function checkDukascopyNode() {
  try {
    execSync('dukascopy-node --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('📦 dukascopy-node not found. Please install it first:');
    console.log('   npm install -g dukascopy-node');
    return false;
  }
}

// Download tick data for a specific month
function downloadMonth(symbol, year, month) {
  const monthStr = month.toString().padStart(2, '0');
  const fromDate = `${year}-${monthStr}-01`;
  
  // Calculate last day of month
  const lastDay = new Date(year, month, 0).getDate();
  const toDate = `${year}-${monthStr}-${lastDay}`;
  
  const outputFile = path.join(OUTPUT_DIR, `${symbol}_TICKS_${year}_${monthStr}.CSV`);
  
  console.log(`\n📥 Downloading ${symbol} - ${year}-${monthStr}...`);
  console.log(`   From: ${fromDate}`);
  console.log(`   To: ${toDate}`);
  
  try {
    const command = `dukascopy-node -i ${symbol} -from ${fromDate} -to ${toDate} -t tick -f csv --cache --batch-size ${BATCH_SIZE} --retries ${RETRIES}`;
    
    execSync(command, { 
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: OUTPUT_DIR
    });
    
    // Find the generated file
    const generatedFile = path.join(OUTPUT_DIR, `${symbol}-${year}-${monthStr}-01-${year}-${monthStr}-${lastDay}-tick.csv`);
    
    if (fs.existsSync(generatedFile)) {
      fs.renameSync(generatedFile, outputFile);
      
      const stats = fs.statSync(outputFile);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`   ✅ Downloaded: ${sizeMB} MB`);
      return true;
    } else {
      console.log(`   ⚠️  File not found`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Failed to download ${symbol} ${year}-${monthStr}`);
    return false;
  }
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.log('🚀 Dukascopy Tick Data Downloader');
  console.log('=================================\n');
  
  if (!checkDukascopyNode()) {
    process.exit(1);
  }
  
  const symbolsToDownload = symbol ? [symbol] : SYMBOLS;
  
  console.log(`📊 Symbols: ${symbolsToDownload.join(', ')}`);
  console.log(`📅 Year: ${year}`);
  console.log(`📆 Months: ${selectedMonths.join(', ')}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`⚡ Batch Size: ${BATCH_SIZE}`);
  console.log(`🔄 Retries: ${RETRIES}\n`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (const sym of symbolsToDownload) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing ${sym}`);
    console.log('='.repeat(50));
    
    for (const month of selectedMonths) {
      const success = downloadMonth(sym, year, month);
      if (success) {
        totalSuccess++;
      } else {
        totalFailed++;
      }
      
      await sleep(1000);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Download Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
