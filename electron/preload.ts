import { contextBridge, ipcRenderer } from 'electron';

// Exposição segura, garantindo que o Browser/React não acesse o fs/path nativamente
contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  parseMetadata: (paths: string[]) => ipcRenderer.invoke('scanner:parseMetadata', paths)
});
