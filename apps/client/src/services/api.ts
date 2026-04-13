import { Candle, Tick, SymbolInfo, Timeframe } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw new Error(`Network error fetching ${url}. Check: (1) backend is running on port 3001, (2) CORS is enabled, (3) no browser extension is blocking the request.`);
  }
}

export const api = {
  async getSymbols(): Promise<string[]> {
    const res = await fetchWithTimeout(`${API_URL}/api/symbols`);
    const data = await res.json();
    return data.symbols;
  },

  async getCandles(symbol: string, timeframe: Timeframe, from?: number, to?: number): Promise<Candle[]> {
    const params = new URLSearchParams({ tf: timeframe });
    if (from) params.append('from', from.toString());
    if (to) params.append('to', to.toString());
    
    const url = `${API_URL}/api/candles/${symbol}?${params}`;
    console.log(`[api] Fetching: ${url}`);
    
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`[api] ${res.status} ${res.statusText} – ${body}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data.candles)) {
      console.error('[api] Unexpected response shape:', data);
      throw new Error('[api] Server response missing "candles" array');
    }
    
    const candles: Candle[] = data.candles;
    console.log(`[api] Received ${candles.length} candles`);
    
    // Guard: warn if time looks like milliseconds
    if (candles.length > 0 && candles[0].time > 1e12) {
      console.warn('[api] WARNING: candle.time values look like milliseconds. Dividing by 1000.');
      return candles.map((c) => ({ ...c, time: Math.floor(c.time / 1000) }));
    }
    
    return candles;
  },

  async getTicks(symbol: string, from?: number, to?: number, limit?: number): Promise<Tick[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toString());
    if (to) params.append('to', to.toString());
    if (limit) params.append('limit', limit.toString());
    
    const res = await fetch(`${API_URL}/api/ticks/${symbol}?${params}`);
    const data = await res.json();
    return data.ticks;
  },

  async getSymbolInfo(symbol: string): Promise<SymbolInfo> {
    const res = await fetch(`${API_URL}/api/symbols/${symbol}/info`);
    return res.json();
  }
};
