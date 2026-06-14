import type { MusicLibraryItem } from '../../core/models/MusicLibraryItem';

export class ElectronLibraryScanner {
  public async scanFiles(paths: any[]): Promise<MusicLibraryItem[]> {
    if (!paths || paths.length === 0) return [];
    
    // @ts-ignore
    // Enviamos a lista crua de Paths. O backend mastiga metadados na velocidade do compilador CPP Node V8
    // sem entupir a RAM do browser.
    const items = await window.electronAPI.parseMetadata(paths);
    return items;
  }
}
