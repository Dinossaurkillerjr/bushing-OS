import { create } from 'zustand';
import type { Track } from '../core/models/Track';
import type { PlayerEngine } from '../core/interfaces/PlayerEngine';
import { useQueueStore } from './useQueueStore';

interface PlayerState {
  engine: PlayerEngine | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;       // Range 0 a 100 visualmente, mas engine converte internamente
  isMuted: boolean;
  
  setEngine: (engine: PlayerEngine) => void;
  loadTrack: (track: Track) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  engine: null,
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 100, // Padronizado em 100 ao invés de 1 na UI final
  isMuted: false,

  setEngine: (engine) => {
    const oldEngine = get().engine;
    if (oldEngine) {
      oldEngine.dispose();
    }

    engine.on('timeupdate', (time: number) => set({ currentTime: time }));
    engine.on('loadedmetadata', (duration: number) => set({ duration: duration }));
    
    // Auto-next track Integration
    engine.on('ended', () => {
      set({ isPlaying: false, currentTime: 0 });
      
      // Enviamos flag 'true' para o nextTrack indicando que foi acionado organicamente (útil para repeat one)
      const nextTrack = useQueueStore.getState().nextTrack(true);
      if (nextTrack) {
        get().loadTrack(nextTrack);
      }
    });
    
    set({ engine });
  },

  loadTrack: async (track) => {
    const { engine } = get();
    if (!engine) return;
    
    set({ currentTrack: track, currentTime: 0, duration: 0 });
    await engine.play(track);
    set({ isPlaying: true });
  },

  play: async () => {
    const { engine, currentTrack } = get();
    if (!engine) return;
    
    await engine.play(currentTrack || undefined);
    set({ isPlaying: true });
  },

  pause: () => {
    const { engine } = get();
    if (!engine) return;
    
    engine.pause();
    set({ isPlaying: false });
  },

  stop: () => {
    const { engine } = get();
    if (!engine) return;
    
    engine.stop();
    set({ isPlaying: false, currentTime: 0 });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  
  setVolume: (volume) => {
    const { engine, isMuted } = get();
    // Converter de 0-100 UI Range para 0.0-1.0 do HTML Engine
    if (engine && !isMuted) engine.setVolume(volume / 100);
    set({ volume });
  },

  toggleMute: () => {
    const { engine, volume, isMuted } = get();
    const newMutedState = !isMuted;
    
    if (engine) {
      if (newMutedState) {
        engine.setVolume(0);
      } else {
        engine.setVolume(volume / 100);
      }
    }
    
    set({ isMuted: newMutedState });
  },

  seek: (time) => {
    const { engine } = get();
    if (engine) engine.seek(time);
    set({ currentTime: time });
  }
}));
