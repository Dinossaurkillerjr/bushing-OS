import React, { useMemo } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import type { SortKey } from '../../store/useLibraryStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useQueueStore } from '../../store/useQueueStore';
import type { MusicLibraryItem } from '../../core/models/MusicLibraryItem';
import { formatTime } from '../../utils/formatTime';

export const Library: React.FC = () => {
  const { tracks, isScanning, error, requestAndScanFolder, searchTerm, setSearchTerm, sortConfig, setSortConfig } = useLibraryStore();
  const { loadTrack } = usePlayerStore();

  const filteredAndSortedTracks = useMemo(() => {
    let result = [...tracks];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) ||
        (t.artist && t.artist.toLowerCase().includes(term)) ||
        (t.album && t.album.toLowerCase().includes(term))
      );
    }

    result.sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (!aVal) aVal = '';
      if (!bVal) bVal = '';

      if (aVal < bVal) return sortConfig.asc ? -1 : 1;
      if (aVal > bVal) return sortConfig.asc ? 1 : -1;
      return 0;
    });

    return result;
  }, [tracks, searchTerm, sortConfig]);

  const handleTrackSelect = async (track: MusicLibraryItem, trackOriginalIndexInsideFilteredOrNot: number) => {
    // Nós podemos criar a queue baseada na lista filtrada/ordenada atual que o usuário está vendo!
    const remainingTracks = filteredAndSortedTracks.slice(trackOriginalIndexInsideFilteredOrNot);
    useQueueStore.getState().setQueue(remainingTracks, 0);
    await loadTrack(remainingTracks[0]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Minha Biblioteca</h2>
        <button 
          style={styles.scanButton}
          disabled={isScanning}
          onClick={requestAndScanFolder}
        >
          {isScanning ? 'Escaneando...' : 'Adicionar Pasta Local'}
        </button>
      </div>

      <div style={styles.filterSection}>
        <input 
          type="search" 
          placeholder="Buscar título, artista ou álbum..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select 
          value={`${sortConfig.key}-${sortConfig.asc}`} 
          onChange={(e) => {
            const [key, asc] = e.target.value.split('-');
            setSortConfig({ key: key as SortKey, asc: asc === 'true' });
          }}
          style={styles.sortSelect}
        >
          <option value="title-true">Nome (A-Z)</option>
          <option value="title-false">Nome (Z-A)</option>
          <option value="artist-true">Artista (A-Z)</option>
          <option value="album-true">Álbum (A-Z)</option>
          <option value="duration-false">Maior Duração</option>
          <option value="duration-true">Menor Duração</option>
        </select>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.listContainer}>
        {isScanning && <div style={styles.loading}>Varrendo arquivos e lendo ID3 Tags. Aguarde...</div>}
        
        {!isScanning && tracks.length === 0 && (
          <div style={styles.emptyState}>Nenhuma música na biblioteca. Selecione uma pasta para começar.</div>
        )}

        {!isScanning && tracks.length > 0 && filteredAndSortedTracks.length === 0 && (
          <div style={styles.emptyState}>Nenhum resultado para a busca.</div>
        )}

        {!isScanning && filteredAndSortedTracks.length > 0 && (
          <div style={styles.table}>
            {filteredAndSortedTracks.map((track, idx) => (
              <div 
                key={track.id} 
                style={styles.trackRow} 
                onClick={() => handleTrackSelect(track, idx)}
              >
                <div style={styles.coverWrapper}>
                  {track.coverArt ? (
                    <img src={track.coverArt} alt="Capa" style={styles.coverImage} />
                  ) : (
                    <div style={styles.placeholderCover}>🎵</div>
                  )}
                </div>
                <div style={styles.trackInfo}>
                  <strong style={styles.title}>{track.title}</strong>
                  <span style={styles.artistAlbum}>{track.artist} • {track.album}</span>
                </div>
                <div style={styles.duration}>
                  {formatTime(track.duration || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    maxHeight: '600px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '10px'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    color: '#E0E0E0',
    borderRadius: '4px'
  },
  sortSelect: {
    padding: '8px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    color: '#E0E0E0',
    borderRadius: '4px'
  },
  scanButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  errorBanner: {
    padding: '10px',
    backgroundColor: '#ef444420',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    color: '#ef4444'
  },
  listContainer: {
    overflowY: 'auto' as const,
    flex: 1
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  },
  table: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '10px',
    backgroundColor: '#2A2A2A',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  coverWrapper: {
    width: '48px',
    height: '48px',
    backgroundColor: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  placeholderCover: {
    fontSize: '20px'
  },
  trackInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'hidden'
  },
  title: {
    fontSize: '1em',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  artistAlbum: {
    fontSize: '0.85em',
    color: '#AAAAAA',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  duration: {
    fontSize: '0.9em',
    color: '#888'
  }
};
