import type { PlayerEngine } from '../../core/interfaces/PlayerEngine';
import type { Track } from '../../core/models/Track';

export class LocalPlayerEngine implements PlayerEngine {
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor() {
    this.audio = new Audio();
    
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', this.audio.currentTime));
    this.audio.addEventListener('loadedmetadata', () => this.emit('loadedmetadata', this.audio.duration));
    this.audio.addEventListener('ended', () => this.emit('ended'));
    this.audio.addEventListener('error', (e) => this.emit('error', e));
  }

  async play(track?: Track): Promise<void> {
    if (track && track.uri !== this.currentTrack?.uri) {
      this.currentTrack = track;
      this.audio.src = track.uri;
      this.audio.load();
    }
    try {
      await this.audio.play();
    } catch (err) {
      console.warn("Autoplay was prevented or resource wasn't accessible", err);
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.emit('timeupdate', 0);
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
    }
  }

  dispose(): void {
    this.stop();
    this.audio.src = '';
    this.eventListeners.clear();
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(...args));
    }
  }
}
