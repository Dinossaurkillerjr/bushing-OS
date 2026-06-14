import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useQueueStore } from '../../store/useQueueStore';
import { LocalPlayerEngine } from '../../providers/local/LocalPlayerEngine';
import { formatTime } from '../../utils/formatTime';

export const PlayerControls: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    engine, 
    setEngine, 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration,
    volume,
    isMuted,
    loadTrack,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute
  } = usePlayerStore();

  const { shuffleEnabled, toggleShuffle, repeatMode, setRepeatMode } = useQueueStore();

  useEffect(() => {
    if (!engine) {
      setEngine(new LocalPlayerEngine());
    }
  }, [engine, setEngine]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUri = URL.createObjectURL(file);
    
    await loadTrack({
      id: crypto.randomUUID(),
      title: file.name,
      uri: fileUri,
      provider: 'local',
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seek(time);
  };

  const handleNext = async () => {
    const next = useQueueStore.getState().nextTrack();
    if (next) await loadTrack(next);
  };

  const handlePrev = async () => {
    const prev = useQueueStore.getState().previousTrack();
    if (prev) await loadTrack(prev);
  };

  return (
    <div style={styles.container}>
      <h2>Controles Básicos do Player</h2>

      <div style={styles.section}>
        <button onClick={() => fileInputRef.current?.click()} style={styles.button}>
          Abrir Áudio Avulso
        </button>
        <input
          type="file"
          accept=".mp3,.wav,.flac,.m4a,.ogg,audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div style={styles.section}>
        <strong>Faixa atual: </strong>
        {currentTrack ? currentTrack.title : 'Nenhuma música carregada'}
      </div>

      <div style={styles.timeContainer}>
        <span>{formatTime(currentTime)}</span>
        <input 
          type="range" 
          min={0} 
          max={duration || 0} 
          value={currentTime} 
          onChange={handleSeek}
          style={styles.progressBar}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div style={styles.controlsRow}>
        <div style={styles.sideControls}>
          <button 
            onClick={toggleShuffle} 
            style={{...styles.iconButton, color: shuffleEnabled ? '#4CAF50' : '#888'}}
            title="Shuffle"
          >
            🔀
          </button>
        </div>

        <div style={styles.mainControls}>
          <button onClick={handlePrev} disabled={!currentTrack} style={styles.buttonTertiary}>
            ⏪
          </button>
          
          {!isPlaying ? (
            <button onClick={play} disabled={!currentTrack} style={styles.button}>▶</button>
          ) : (
            <button onClick={pause} disabled={!currentTrack} style={styles.button}>⏸</button>
          )}
          
          <button onClick={stop} disabled={!currentTrack} style={styles.buttonTertiary}>
            ⏹
          </button>

          <button onClick={handleNext} disabled={!currentTrack} style={styles.buttonTertiary}>
            ⏩
          </button>
        </div>

        <div style={styles.sideControls}>
          <button 
            onClick={() => {
               if (repeatMode === 'off') setRepeatMode('queue');
               else if (repeatMode === 'queue') setRepeatMode('one');
               else setRepeatMode('off');
            }} 
            style={{...styles.iconButton, color: repeatMode !== 'off' ? '#4CAF50' : '#888'}}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? '🔂' : '🔁'}
          </button>
        </div>
      </div>

      <div style={styles.volumeContainer}>
        <button onClick={toggleMute} style={styles.iconButton}>
          {isMuted || volume === 0 ? '🔇' : (volume > 50 ? '🔊' : '🔉')}
        </button>
        <input 
          type="range" 
          min="0" 
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={styles.volumeSlider}
          disabled={!engine}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#2A2A2A',
    color: '#E0E0E0',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px'
  },
  timeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  progressBar: {
    flex: 1,
    cursor: 'pointer'
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  mainControls: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  sideControls: {
    display: 'flex',
    gap: '5px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonTertiary: {
    padding: '10px 15px',
    backgroundColor: '#444',
    border: 'none',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
  },
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px',
    justifyContent: 'flex-end',
    width: '100%'
  },
  volumeSlider: {
    width: '100px',
    cursor: 'pointer'
  }
};
