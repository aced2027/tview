import { describe, it, expect, beforeEach } from 'vitest';
import { TickLoader } from './tickLoader';
import fs from 'fs';
import path from 'path';

describe('TickLoader', () => {
  const testDataPath = './test-data';
  let loader: TickLoader;

  beforeEach(() => {
    if (!fs.existsSync(testDataPath)) {
      fs.mkdirSync(testDataPath, { recursive: true });
    }
    loader = new TickLoader(testDataPath);
  });

  it('should detect symbols from filenames', () => {
    const testFile = path.join(testDataPath, 'EURUSD_test.csv');
    fs.writeFileSync(testFile, 'timestamp,bid,ask,last,volume\n1000000,1.08,1.082,1.081,100');
    
    const symbols = loader.detectSymbols();
    expect(symbols).toContain('EURUSD');
    
    fs.unlinkSync(testFile);
  });

  it('should parse CSV files correctly', async () => {
    const testFile = path.join(testDataPath, 'GBPUSD_test.csv');
    fs.writeFileSync(testFile, 'timestamp,bid,ask,last,volume\n1000000,1.25,1.252,1.251,100\n2000000,1.253,1.255,1.254,150');
    
    const ticks = await loader.loadTicks('GBPUSD');
    expect(ticks).toHaveLength(2);
    expect(ticks[0].bid).toBe(1.25);
    expect(ticks[1].volume).toBe(150);
    
    fs.unlinkSync(testFile);
  });

  it('should handle missing files gracefully', async () => {
    const ticks = await loader.loadTicks('NONEXISTENT');
    expect(ticks).toHaveLength(0);
  });
});
