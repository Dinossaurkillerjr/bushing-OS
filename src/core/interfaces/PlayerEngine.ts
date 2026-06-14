import type { Track } from '../models/Track';

export interface PlayerEngine {
  play(track?: Track): Promise<void>;
  pause(): void;
  stop(): void;
  setVolume(volume: number): void;
  seek(time: number): void;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  dispose(): void;
}
