import { create } from 'zustand';
import type { MusicLibraryItem } from '../core/models/MusicLibraryItem';
import { LocalLibraryScanner } from '../providers/local/LocalLibraryScanner';
import { BrowserFileSystemProvider } from '../providers/local/BrowserFileSystemProvider';
import { ElectronLibraryScanner } from '../providers/electron/ElectronLibraryScanner';
import { ElectronFileSystemProvider } from '../providers/electron/ElectronFileSystemProvider';
import { defaultPersistence } from '../providers/local/LocalStoragePersistenceProvider';

export type SortKey = 'title' | 'artist' | 'album' | 'duration';

interface SortConfig {
  key: SortKey;
  asc: boolean;
}

interface LibraryState {
  tracks: MusicLibraryItem[];
  isScanning: boolean;
  error: string | null;
  
  searchTerm: string;
  sortConfig: SortConfig;

  requestAndScanFolder: () => Promise<void>;
  clearLibrary: () => void;
  
  setSearchTerm: (term: string) => void;
  setSortConfig: (config: SortConfig) => void;

  loadPersistedState: () => Promise<void>;
  saveState: () => Promise<void>;
}

// @ts-ignore Pula verificação local pra flag não estourar em build step
const isElectron = typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';

const scanner = isElectron ? new ElectronLibraryScanner() : new LocalLibraryScanner();
const fsProvider = isElectron ? new ElectronFileSystemProvider() : new BrowserFileSystemProvider();

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  isScanning: false,
  error: null,
  searchTerm: '',
  sortConfig: { key: 'title', asc: true },

  saveState: async () => {
    const s = get();
    await defaultPersistence.setItem('musicos_library', {
      tracks: s.tracks,
      sortConfig: s.sortConfig
    });
  },

  loadPersistedState: async () => {
    const data = await defaultPersistence.getItem<Partial<LibraryState>>('musicos_library');
    if (data) {
      set({ 
        tracks: data.tracks || [],
        sortConfig: data.sortConfig || { key: 'title', asc: true }
      });
    }
  },

  requestAndScanFolder: async () => {
    try {
      const files = await fsProvider.requestFolderSelection();
      if (!files || files.length === 0) return;

      set({ isScanning: true, error: null });
      const newItems = await scanner.scanFiles(files);
      
      set({ tracks: newItems, isScanning: false });
      get().saveState();
    } catch (err: any) {
      set({ error: err.message || 'Erro inesperado ao escanear a pasta', isScanning: false });
    }
  },

  clearLibrary: () => {
    set({ tracks: [], error: null });
    get().saveState();
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  setSortConfig: (config) => {
    set({ sortConfig: config });
    get().saveState();
  }
}));
