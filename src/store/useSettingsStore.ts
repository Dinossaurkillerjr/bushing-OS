import { create } from 'zustand';
import { defaultPersistence } from '../providers/local/LocalStoragePersistenceProvider';

interface SettingsState {
  defaultVolume: number;
  behaviors: {
    startPlayingOnLoad: boolean;
  };
  setVolume: (v: number) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  defaultVolume: 1, // Ex: 1 = 100%
  behaviors: { startPlayingOnLoad: false },

  setVolume: (v) => {
    set({ defaultVolume: v });
    get().saveSettings();
  },
  
  loadSettings: async () => {
    const data = await defaultPersistence.getItem<{ defaultVolume: number }>('musicos_settings');
    if (data && typeof data.defaultVolume === 'number') {
      set({ defaultVolume: data.defaultVolume });
    }
  },
  
  saveSettings: async () => {
    const state = get();
    await defaultPersistence.setItem('musicos_settings', {
      defaultVolume: state.defaultVolume,
    });
  }
}));
