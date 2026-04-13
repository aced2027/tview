import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { Tick } from '../types/index.js';

export class TickLoader {
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  detectSymbols(): string[] {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(this.dataPath);
    const symbols = new Set<string>();

    for (const file of files) {
      const symbol = this.extractSymbolFromFilename(file);
      if (symbol) symbols.add(symbol);
    }

    return Array.from(symbols).sort();
  }

  private extractSymbolFromFilename(filename: string): string | null {
    const match = filename.match(/^([A-Z]{6})/);
    return match ? match[1] : null;
  }

  async loadTicks(symbol: string, from?: number, to?: number, limit?: number): Promise<Tick[]> {
    const files = this.findFilesForSymbol(symbol);
    if (files.length === 0) return [];

    // Sort files in chronological order (oldest first) to show data from start
    files.sort();

    let allTicks: Tick[] = [];
    const targetLimit = limit || 10000000; // Default to 10M ticks if no limit
    
    // Load files until we have enough ticks
    for (const file of files) {
      const ticks = await this.parseFile(file);
      allTicks = allTicks.concat(ticks);
      
      // If we have enough data, stop loading more files
      if (allTicks.length >= targetLimit) {
        break;
      }
    }

    allTicks.sort((a, b) => a.timestamp - b.timestamp);

    if (from) allTicks = allTicks.filter(t => t.timestamp >= from);
    if (to) allTicks = allTicks.filter(t => t.timestamp <= to);
    if (limit && allTicks.length > limit) allTicks = allTicks.slice(0, limit);

    return allTicks;
  }

  private findFilesForSymbol(symbol: string): string[] {
    if (!fs.existsSync(this.dataPath)) return [];
    
    const files = fs.readdirSync(this.dataPath);
    return files
      .filter(f => f.startsWith(symbol))
      .map(f => path.join(this.dataPath, f));
  }

  private async parseFile(filepath: string): Promise<Tick[]> {
    const ext = path.extname(filepath).toLowerCase();
    const isGzip = filepath.endsWith('.gz');
    const actualExt = isGzip ? path.extname(filepath.slice(0, -3)).toLowerCase() : ext;

    let content: string;

    if (isGzip) {
      content = await this.readGzipFile(filepath);
    } else {
      content = fs.readFileSync(filepath, 'utf-8');
    }

    if (actualExt === '.json') {
      return this.parseJSON(content);
    } else if (actualExt === '.csv') {
      return this.parseCSV(content);
    }

    return [];
  }

  private async readGzipFile(filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      createReadStream(filepath)
        .pipe(createGunzip())
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        .on('error', reject);
    });
  }

  private parseJSON(content: string): Tick[] {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      timestamp: item.t || item.time || item.timestamp,
      bid: item.b || item.bid,
      ask: item.a || item.ask,
      last: item.l || item.last || 0,
      volume: item.v || item.volume || 0
    }));
  }

  private parseCSV(content: string): Tick[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];
    
    const header = lines[0].toLowerCase();
    const hasHeader = isNaN(Number(lines[0].split(',')[0]));
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Detect format based on header
    const isDukascopyFormat = header.includes('timestamp_ms') || header.includes('datetime_utc');
    
    return dataLines.map(line => {
      const parts = line.split(',').map(v => v.trim());
      
      if (isDukascopyFormat) {
        // Format: timestamp_ms,datetime_utc,ask,bid,ask_volume,bid_volume
        const timestamp = parseFloat(parts[0]);
        const ask = parseFloat(parts[2]);
        const bid = parseFloat(parts[3]);
        const last = (bid + ask) / 2;
        const volume = parseFloat(parts[4]) || 0;
        
        return { timestamp, bid, ask, last, volume };
      } else {
        // Standard format: timestamp,bid,ask,last,volume
        const [timestamp, bid, ask, last, volume] = parts.map(v => parseFloat(v));
        return { timestamp, bid, ask, last: last || 0, volume: volume || 0 };
      }
    }).filter(tick => !isNaN(tick.timestamp) && !isNaN(tick.bid) && !isNaN(tick.ask));
  }
}
