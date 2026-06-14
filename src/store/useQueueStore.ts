import { create } from 'zustand';
import type { Track } from '../core/models/Track';
import { defaultPersistence } from '../providers/local/LocalStoragePersistenceProvider';

type RepeatMode = 'off' | 'one' | 'queue';

interface QueueState {
  queue: Track[];
  originalQueue: Track[]; // Utilizado para restaurar estado ao desligar shuffle
  currentIndex: number;
  
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  
  addTrack: (track: Track) => void;
  removeTrack: (index: number) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  setCurrentTrack: (index: number) => void;
  
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  
  moveTrack: (fromIndex: number, toIndex: number) => void; // Reorder

  nextTrack: (isAutoEnded?: boolean) => Track | null;
  previousTrack: () => Track | null;
  
  loadPersistedState: () => Promise<void>;
  saveState: () => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  shuffleEnabled: false,
  repeatMode: 'off',

  saveState: async () => {
    const s = get();
    await defaultPersistence.setItem('musicos_queue', {
      queue: s.queue,
      originalQueue: s.originalQueue,
      currentIndex: s.currentIndex,
      shuffleEnabled: s.shuffleEnabled,
      repeatMode: s.repeatMode
    });
  },

  loadPersistedState: async () => {
    const data = await defaultPersistence.getItem<Partial<QueueState>>('musicos_queue');
    if (data) {
      set({ 
        queue: data.queue || [],
        originalQueue: data.originalQueue || [],
        currentIndex: data.currentIndex !== undefined ? data.currentIndex : -1,
        shuffleEnabled: data.shuffleEnabled || false,
        repeatMode: data.repeatMode || 'off'
      });
    }
  },

  addTrack: (track) => {
    set((state) => ({ 
      queue: [...state.queue, track],
      originalQueue: [...state.originalQueue, track]
    }));
    get().saveState();
  },
  
  removeTrack: (index) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      let newIndex = state.currentIndex;
      if (state.currentIndex > index) {
        newIndex--;
      } else if (state.currentIndex === index && index >= newQueue.length) {
        newIndex = -1;
      }
      return { queue: newQueue, currentIndex: newIndex };
    });
    // Precisaríamos refletir no originalQueue também, mas vamos simplificar resetando originalQueue ao remover do shuffle
    const s = get();
    if (s.shuffleEnabled) {
      set({ originalQueue: [...s.queue] });
    } else {
      set({ originalQueue: [...s.queue] });
    }
    get().saveState();
  },
  
  clearQueue: () => {
    set({ queue: [], originalQueue: [], currentIndex: -1 });
    get().saveState();
  },
  
  setQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, originalQueue: tracks, currentIndex: startIndex, shuffleEnabled: false });
    get().saveState();
  },
  
  setCurrentTrack: (index) => {
     const { queue } = get();
     if (index >= 0 && index < queue.length) {
       set({ currentIndex: index });
       get().saveState();
     }
  },

  moveTrack: (from, to) => {
    set((state) => {
      const newQ = [...state.queue];
      const [item] = newQ.splice(from, 1);
      newQ.splice(to, 0, item);
      
      let newIndex = state.currentIndex;
      if (state.currentIndex === from) newIndex = to;
      else if (state.currentIndex > from && state.currentIndex <= to) newIndex--;
      else if (state.currentIndex < from && state.currentIndex >= to) newIndex++;
      
      return { queue: newQ, currentIndex: newIndex, originalQueue: [...newQ] };
    });
    get().saveState();
  },

  toggleShuffle: () => {
    const { shuffleEnabled, queue, currentIndex, originalQueue } = get();
    
    if (shuffleEnabled) {
      // Unshuffle -> Voltar a fila original
      const currentTrack = queue[currentIndex];
      const newIndex = originalQueue.findIndex(t => t.id === currentTrack?.id);
      set({ shuffleEnabled: false, queue: [...originalQueue], currentIndex: newIndex !== -1 ? newIndex : 0 });
    } else {
      // Shuffle -> Criar nova fila randomizada começando depois da atual
      if (queue.length === 0) {
         set({ shuffleEnabled: true });
         get().saveState();
         return;
      }
      
      const trackAtHand = queue[currentIndex];
      const trackId = trackAtHand?.id;
      
      // Remove atual, randomiza resto, insere atual no top
      const others = queue.filter(t => t.id !== trackId);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      
      let newQueue = trackAtHand ? [trackAtHand, ...others] : [...others];
      set({ shuffleEnabled: true, originalQueue: [...queue], queue: newQueue, currentIndex: trackAtHand ? 0 : -1 });
    }
    get().saveState();
  },

  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
    get().saveState();
  },

  nextTrack: (isAutoEnded = false) => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return null;

    if (isAutoEnded && repeatMode === 'one') {
      // Reproduzir exatamente a mesma track
      return queue[currentIndex];
    }

    if (currentIndex + 1 < queue.length) {
      const nextIdx = currentIndex + 1;
      set({ currentIndex: nextIdx });
      get().saveState();
      return queue[nextIdx];
    }

    if (repeatMode === 'queue') {
       set({ currentIndex: 0 });
       get().saveState();
       return queue[0];
    }

    return null;
  },
  
  previousTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return null;
    
    // Comportamento simples (poderiamos checar se passou > 3s pra voltar o atual do Player)
    if (currentIndex - 1 >= 0) {
      const prevIdx = currentIndex - 1;
      set({ currentIndex: prevIdx });
      get().saveState();
      return queue[prevIdx];
    }
    return null;
  }
}));
