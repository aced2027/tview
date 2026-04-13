import { Tick } from '../types/index.js';
import { TickLoader } from './tickLoader.js';

export class TickStreamer {
  private loader: TickLoader;
  private streams: Map<string, NodeJS.Timeout> = new Map();
  private replaySpeed: number = 1;

  constructor(loader: TickLoader) {
    this.loader = loader;
  }

  setReplaySpeed(speed: number) {
    this.replaySpeed = speed;
  }

  async startStream(symbol: string, callback: (tick: Tick) => void): Promise<void> {
    if (this.streams.has(symbol)) return;

    const ticks = await this.loader.loadTicks(symbol);
    if (ticks.length === 0) return;

    let index = 0;
    const stream = () => {
      if (index >= ticks.length) {
        index = 0; // Loop back
      }

      const tick = ticks[index];
      callback(tick);
      index++;

      const nextDelay = index < ticks.length 
        ? Math.max(1, (ticks[index].timestamp - tick.timestamp) / this.replaySpeed)
        : 1000;

      const timeout = setTimeout(stream, nextDelay);
      this.streams.set(symbol, timeout);
    };

    stream();
  }

  stopStream(symbol: string): void {
    const timeout = this.streams.get(symbol);
    if (timeout) {
      clearTimeout(timeout);
      this.streams.delete(symbol);
    }
  }

  stopAll(): void {
    for (const symbol of this.streams.keys()) {
      this.stopStream(symbol);
    }
  }
}
