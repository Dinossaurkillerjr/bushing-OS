import React from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';

export const Queue: React.FC = () => {
  const { queue, currentIndex, setCurrentTrack, removeTrack, moveTrack, clearQueue } = useQueueStore();
  const { loadTrack } = usePlayerStore();

  const handleTrackClick = async (index: number) => {
    setCurrentTrack(index);
    await loadTrack(queue[index]);
  };

  if (queue.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Fila de Reprodução ({queue.length})</h3>
        <button onClick={clearQueue} style={styles.clearButton}>Limpar Fila</button>
      </div>
      <div style={styles.list}>
        {queue.map((track, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div 
              key={`${track.id}-${index}`} 
              style={{
                ...styles.trackRow,
                backgroundColor: isCurrent ? '#3a3a3a' : 'transparent',
                fontWeight: isCurrent ? 'bold' : 'normal',
                color: isCurrent ? '#4CAF50' : '#E0E0E0'
              }}
              onClick={() => handleTrackClick(index)}
            >
              <div style={styles.indicator}>
                {isCurrent ? '▶' : index + 1}
              </div>
              <div style={styles.trackInfo}>
                <span style={styles.trackTitle}>{track.title}</span>
                <span style={styles.trackArtist}>{track.artist}</span>
              </div>
              <div style={styles.duration}>
                {formatTime(track.duration || 0)}
              </div>
              <div style={styles.actions}>
                 <button 
                   onClick={(e) => { e.stopPropagation(); if(index > 0) moveTrack(index, index - 1); }} 
                   style={styles.actionBtn}>▲</button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); if(index < queue.length - 1) moveTrack(index, index + 1); }} 
                   style={styles.actionBtn}>▼</button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); removeTrack(index); }} 
                   style={{...styles.actionBtn, color: '#ef4444'}}>✖</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '15px',
    backgroundColor: '#1E1E1E',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%',
    maxHeight: '400px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.8em',
    textDecoration: 'underline'
  },
  title: {
    margin: 0,
    fontSize: '1em',
    color: '#888'
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    overflowY: 'auto' as const
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  indicator: {
    width: '24px',
    fontSize: '0.85em',
    color: '#888'
  },
  trackInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'hidden'
  },
  trackTitle: {
    fontSize: '0.9em',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  trackArtist: {
    fontSize: '0.75em',
    color: '#AAAAAA',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  duration: {
    fontSize: '0.85em',
    color: '#888',
    marginRight: '10px'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    padding: '2px',
    fontSize: '0.8em'
  }
};
