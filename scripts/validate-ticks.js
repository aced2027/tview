#!/usr/bin/env node

/**
 * Tick Data Validator
 * 
 * Validates tick data files to ensure they're in the correct format.
 * 
 * Usage:
 *   node scripts/validate-ticks.js apps/server/data/ticks/EURUSD_ticks.csv
 */

const fs = require('fs');
const path = require('path');

function validateCSV(filepath) {
  console.log(`\n🔍 Validating: ${filepath}\n`);

  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');

  let errors = [];
  let warnings = [];
  let info = [];

  // Check 1: Filename format
  const symbolMatch = filename.match(/^([A-Z]{6})/);
  if (!symbolMatch) {
    errors.push('❌ Filename must start with 6-letter symbol (e.g., EURUSD_ticks.csv)');
  } else {
    info.push(`✅ Symbol detected: ${symbolMatch[1]}`);
  }

  // Check 2: File not empty
  if (lines.length < 2) {
    errors.push('❌ File is empty or has no data rows');
    return { errors, warnings, info };
  }

  // Check 3: Header row
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  info.push(`📋 Columns: ${header.join(', ')}`);

  const requiredCols = ['timestamp', 'bid', 'ask'];
  const hasRequired = requiredCols.every(col => 
    header.some(h => [col, col[0]].includes(h))
  );

  if (!hasRequired) {
    errors.push(`❌ Missing required columns. Need: timestamp, bid, ask`);
    errors.push(`   Found: ${header.join(', ')}`);
  }

  // Check 4: Data validation (sample first 10 rows)
  const sampleSize = Math.min(10, lines.length - 1);
  let validRows = 0;
  let invalidRows = 0;

  for (let i = 1; i <= sampleSize; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== header.length) {
      invalidRows++;
      warnings.push(`⚠️  Row ${i}: Column count mismatch (expected ${header.length}, got ${values.length})`);
      continue;
    }

    const timestamp = parseFloat(values[0]);
    const bid = parseFloat(values[1]);
    const ask = parseFloat(values[2]);

    if (isNaN(timestamp)) {
      invalidRows++;
      warnings.push(`⚠️  Row ${i}: Invalid timestamp: ${values[0]}`);
      continue;
    }

    if (timestamp < 10000000000) {
      warnings.push(`⚠️  Row ${i}: Timestamp looks like seconds, not milliseconds (${timestamp})`);
    }

    if (isNaN(bid) || isNaN(ask)) {
      invalidRows++;
      warnings.push(`⚠️  Row ${i}: Invalid bid/ask: ${values[1]}, ${values[2]}`);
      continue;
    }

    if (bid >= ask) {
      warnings.push(`⚠️  Row ${i}: Bid >= Ask (${bid} >= ${ask})`);
    }

    validRows++;
  }

  info.push(`📊 Total rows: ${lines.length - 1}`);
  info.push(`✅ Valid rows (sample): ${validRows}/${sampleSize}`);
  
  if (invalidRows > 0) {
    warnings.push(`⚠️  Invalid rows (sample): ${invalidRows}/${sampleSize}`);
  }

  // Check 5: Timestamp range
  if (validRows > 0) {
    const firstRow = lines[1].split(',');
    const lastRow = lines[lines.length - 1].split(',');
    const firstTs = parseFloat(firstRow[0]);
    const lastTs = parseFloat(lastRow[0]);

    if (firstTs < 10000000000) {
      warnings.push(`⚠️  Timestamps appear to be in seconds, not milliseconds`);
      warnings.push(`   Convert: timestamp * 1000`);
    } else {
      const firstDate = new Date(firstTs);
      const lastDate = new Date(lastTs);
      info.push(`📅 Date range: ${firstDate.toISOString()} to ${lastDate.toISOString()}`);
      
      const duration = (lastTs - firstTs) / 1000 / 60; // minutes
      info.push(`⏱️  Duration: ${duration.toFixed(2)} minutes`);
    }
  }

  // Check 6: File size
  const stats = fs.statSync(filepath);
  const sizeMB = stats.size / 1024 / 1024;
  info.push(`💾 File size: ${sizeMB.toFixed(2)} MB`);

  if (sizeMB > 100) {
    warnings.push(`⚠️  Large file (${sizeMB.toFixed(0)} MB). Consider compressing with gzip.`);
  }

  return { errors, warnings, info };
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Tick Data Validator

Usage:
  node scripts/validate-ticks.js <tick-file>

Example:
  node scripts/validate-ticks.js apps/server/data/ticks/EURUSD_ticks.csv

Or validate all files:
  node scripts/validate-ticks.js apps/server/data/ticks/*.csv
  `);
  process.exit(1);
}

let totalFiles = 0;
let totalErrors = 0;
let totalWarnings = 0;

for (const filepath of args) {
  if (!fs.existsSync(filepath)) {
    console.error(`❌ File not found: ${filepath}`);
    continue;
  }

  totalFiles++;
  const { errors, warnings, info } = validateCSV(filepath);

  // Print info
  info.forEach(msg => console.log(msg));

  // Print warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(msg => console.log(`  ${msg}`));
    totalWarnings += warnings.length;
  }

  // Print errors
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(msg => console.log(`  ${msg}`));
    totalErrors += errors.length;
  }

  if (errors.length === 0) {
    console.log('\n✅ File is valid!\n');
  } else {
    console.log('\n❌ File has errors. Please fix before using.\n');
  }

  console.log('─'.repeat(60));
}

// Summary
if (totalFiles > 1) {
  console.log(`\n📊 Summary:`);
  console.log(`   Files validated: ${totalFiles}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  
  if (totalErrors === 0) {
    console.log(`\n✅ All files are valid!`);
  } else {
    console.log(`\n❌ Some files have errors. Please fix before using.`);
  }
}
