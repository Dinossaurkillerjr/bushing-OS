import React, { useState, useEffect } from 'react';
import { PlayerControls } from './components/PlayerControls/PlayerControls';
import { Library } from './components/Library/Library';
import { Queue } from './components/Queue/Queue';
import { Settings } from './components/Settings/Settings';
import { DebugPanel } from './components/DebugPanel/DebugPanel';

import { useLibraryStore } from './store/useLibraryStore';
import { useQueueStore } from './store/useQueueStore';
import { useSettingsStore } from './store/useSettingsStore';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'settings' | 'debug'>('library');

  // Ao iniciar a HUD, invocamos as rotinas assíncronas do Persistence Provider de base
  useEffect(() => {
    const hydrateStores = async () => {
      // Configuramos explicitamente a carga em background pra todos os domínios
      await useSettingsStore.getState().loadSettings();
      await useLibraryStore.getState().loadPersistedState();
      await useQueueStore.getState().loadPersistedState();
    };
    hydrateStores();
  }, []);

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Music OS</h1>
      </header>
      
      <main style={styles.main}>
        {/* Dock Fixo Esquerdo - Core Player */}
        <div style={styles.leftDock}>
          <PlayerControls />
          <Queue />
        </div>
        
        {/* Painel Central Flexível (Navegação temporária simulando módulos livres como requisitado) */}
        <div style={styles.centerArea}>
          <div style={styles.navigationRow}>
            <button 
              style={activeTab === 'library' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('library')}
            >
              Biblioteca Local
            </button>
            <button 
              style={activeTab === 'settings' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('settings')}
            >
              Configurações
            </button>
            <button 
              style={activeTab === 'debug' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('debug')}
            >
              Console do Sistema
            </button>
          </div>

          <div style={styles.panelContainer}>
            {activeTab === 'library' && <Library />}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'debug' && <DebugPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0f0f0f',
    color: '#E0E0E0',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#151515',
    borderBottom: '1px solid #333'
  },
  main: {
    display: 'flex',
    flex: 1,
    padding: '30px',
    gap: '30px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  leftDock: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    flexShrink: 0
  },
  centerArea: {
    flex: 1,
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  navigationRow: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#1E1E1E',
    padding: '10px',
    borderRadius: '8px'
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#888',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  tabActive: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  panelContainer: {
    flex: 1
  }
};

export default App;
