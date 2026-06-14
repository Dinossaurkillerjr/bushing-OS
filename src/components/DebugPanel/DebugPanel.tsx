import React from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useQueueStore } from '../../store/useQueueStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';

export const DebugPanel: React.FC = () => {
  const { tracks } = useLibraryStore();
  const { queue, currentIndex, shuffleEnabled, repeatMode } = useQueueStore();
  const { volume, isPlaying, currentTime, isMuted } = usePlayerStore();

  const runDiagnostics = () => {
    console.warn("=== Diagnóstico Global Music OS ===");
    console.log(`Library Store: ${tracks.length} faixas carregadas.`);
    console.log(`Queue Store: ${queue.length} faixas na fila, Index atual: ${currentIndex}`);
    console.log(`Queue Flags: Shuffle=${shuffleEnabled}, Repeat=${repeatMode}`);
    console.log(`Player Store: Volume=${volume}, Mute=${isMuted}, Playing=${isPlaying}`);
    console.log("Memory Pointer Queue Array:");
    console.table(queue);
    alert("Varrer os states foi um sucesso! Cheque o painel Inspect Console do Browser.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Developer Painel de Debug</h2>
        <button onClick={runDiagnostics} style={styles.btn}>Executar Diagnóstico Profundo</button>
      </div>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.label}>Biblioteca Virtual (Faixas Raw)</span>
          <strong style={styles.value}>{tracks.length} records</strong>
        </div>
        
        <div style={styles.card}>
          <span style={styles.label}>Índice da Fila Linear</span>
          <strong style={styles.value}>{queue.length > 0 ? currentIndex : 'Vazio'} ({queue.length} itens)</strong>
        </div>
        
        <div style={styles.card}>
          <span style={styles.label}>Gerenciador de Estado Fila</span>
          <strong style={styles.value}>{shuffleEnabled ? 'Shuffle Ligado' : 'Shuffle Desligado'} • {repeatMode.toUpperCase()}</strong>
        </div>
        
        <div style={styles.card}>
          <span style={styles.label}>Dados da Engine</span>
          <strong style={styles.value}>{volume}% Vol • Mutado: {isMuted ? 'Sim' : 'Não'}</strong>
        </div>
        
        <div style={styles.card}>
          <span style={styles.label}>Timeline Tick</span>
          <strong style={styles.value}>{formatTime(currentTime)}</strong>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    padding: '20px', 
    backgroundColor: '#1E1E1E', 
    color: '#E0E0E0', 
    borderRadius: '8px', 
    border: '2px dashed #9333ea',
    height: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  btn: { 
    padding: '10px 15px', 
    background: '#9333ea', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '15px' 
  },
  card: {
    backgroundColor: '#3b2160',
    padding: '15px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px'
  },
  label: { color: '#d8b4fe', fontSize: '0.8em', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  value: { fontSize: '1.1em' }
};
