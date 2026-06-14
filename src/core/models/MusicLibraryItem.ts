import type { Track } from './Track';

export interface MusicLibraryItem extends Track {
  filePath: string;
  addedAt: number;
}
