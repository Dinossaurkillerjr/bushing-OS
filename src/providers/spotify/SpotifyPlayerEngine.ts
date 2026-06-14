import type { PlayerEngine } from '../../core/interfaces/PlayerEngine';
import type { Track } from '../../core/models/Track';

export class SpotifyPlayerEngine implements PlayerEngine {
  async play(track?: Track): Promise<void> {
    throw new Error('Spotify is not yet implemented.');
  }
  pause(): void { throw new Error('Spotify is not yet implemented.'); }
  stop(): void { throw new Error('Spotify is not yet implemented.'); }
  setVolume(volume: number): void { throw new Error('Spotify is not yet implemented.'); }
  seek(time: number): void { throw new Error('Spotify is not yet implemented.'); }
  on(event: string, callback: (...args: any[]) => void): void { throw new Error('Spotify is not yet implemented.'); }
  off(event: string, callback: (...args: any[]) => void): void { throw new Error('Spotify is not yet implemented.'); }
  dispose(): void {}
}
