import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Settings: React.FC = () => {
  const { defaultVolume, behaviors, setVolume } = useSettingsStore();

  return (
    <div style={styles.container}>
      <h2>Configurações do Music OS</h2>
      <p style={{color: '#888'}}>Estas configurações são salvas atomicamente com o HUD.</p>
      
      <div style={styles.section}>
        <label style={styles.label}>Volume Padrão Inicial ({defaultVolume}%)</label>
        <input 
          type="range" 
          min="0" max="100" 
          value={defaultVolume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>
      
      <div style={styles.section}>
        <label style={styles.label}>
          <input 
             type="checkbox" 
             checked={behaviors.startPlayingOnLoad} 
             readOnly
             disabled
          />
           Tocar automaticamente ao carregar (Em Desenvolvimento)
        </label>
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
    height: '100%' 
  },
  section: { 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: '5px', 
    marginBottom: '20px' 
  },
  label: {
    fontSize: '0.9em',
    marginBottom: '5px'
  }
};
