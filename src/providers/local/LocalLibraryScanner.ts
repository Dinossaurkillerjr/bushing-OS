import * as mm from 'music-metadata';
import type { MusicLibraryItem } from '../../core/models/MusicLibraryItem';

export class LocalLibraryScanner {
  // Configuro extensões permitidas e compatíveis
  private allowedExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg'];

  public async scanFiles(files: File[]): Promise<MusicLibraryItem[]> {
    const validFiles = files.filter(f => 
      this.allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    
    const items: MusicLibraryItem[] = [];

    for (const file of validFiles) {
      try {
        const metadata = await mm.parseBlob(file);
        
        let coverArtUrl: string | undefined;
        let p = metadata.common.picture;
        const picture = (p && p.length > 0) ? p[0] : null;
        
        if (picture) {
          const blob = new Blob([picture.data], { type: picture.format });
          coverArtUrl = URL.createObjectURL(blob);
        }

        const audioUri = URL.createObjectURL(file);

        // Fallbacks se as tags ID3 do arquivo não contiverem nada
        const fallbackTitle = file.name.replace(/\.[^/.]+$/, ""); // strip extension

        items.push({
          id: crypto.randomUUID(),
          title: metadata.common.title || fallbackTitle,
          artist: metadata.common.artist || 'Artista Desconhecido',
          album: metadata.common.album || 'Álbum Desconhecido',
          duration: metadata.format.duration || 0,
          coverArt: coverArtUrl,
          uri: audioUri,
          provider: 'local',
          filePath: file.webkitRelativePath || file.name,
          addedAt: Date.now()
        });
      } catch (err) {
        // Fallback completo se der exceção brusca na leitura binária ou se for incompatível
        console.warn(`[LocalLibraryScanner] Falha metadata do arquivo ${file.name}. Gerando entidade genérica.`, err);
        const fallbackAudioUri = URL.createObjectURL(file);
        
        items.push({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Artista Desconhecido',
          album: 'Diversos',
          duration: 0,
          coverArt: undefined, // undefined faz exibir o ícone padrão de Placeholder
          uri: fallbackAudioUri,
          provider: 'local',
          filePath: file.webkitRelativePath || file.name,
          addedAt: Date.now()
        });
      }
    }

    return items;
  }
}
