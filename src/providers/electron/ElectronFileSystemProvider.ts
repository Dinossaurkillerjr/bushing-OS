import type { FileSystemProvider } from '../../core/interfaces/FileSystemProvider';

export class ElectronFileSystemProvider implements FileSystemProvider {
  public async requestFolderSelection(): Promise<any[]> {
    // @ts-ignore
    if (typeof window.electronAPI === 'undefined') return [];
    
    // @ts-ignore - Delegando a API do ContextBridge (Preload)
    const paths = await window.electronAPI.openFolder();
    return paths; // Retorna um array de paths strings direto do SO! NENHUM mock de <File>.
  }
}
