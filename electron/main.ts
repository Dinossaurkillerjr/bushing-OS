import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import path from 'node:path';
import fs from 'fs';
import * as mm from 'music-metadata';
import url, { fileURLToPath } from 'node:url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Protocolo dedicado (musicos://) para poder ler arquivos locais em disco ignorando o CORS do Chromium
app.whenReady().then(() => {
  protocol.registerFileProtocol('musicos', (request, callback) => {
    const filePath = url.fileURLToPath(
      'file://' + request.url.slice('musicos://'.length)
    );
    callback({ path: decodeURIComponent(filePath) });
  });
});

let mainWindow: BrowserWindow | null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true // Segurança ativada obrigatoriamente
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handler - Diálogo de Abrir Pasta e ler arquivos puros
ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled || result.filePaths.length === 0) return [];
  
  const folderPath = result.filePaths[0];
  const files = fs.readdirSync(folderPath);
  
  const allowed = ['.mp3', '.wav', '.flac', '.m4a', '.ogg'];
  
  // Retorna Array of Absolute Paths Strings
  const fullPaths = files
    .filter(f => allowed.some(ext => f.toLowerCase().endsWith(ext)))
    .map(f => path.join(folderPath, f));
    
  return fullPaths;
});

// IPC Handler - Scanner de Backend Purista que quebra o metadata rápido com Buffer e fs sem o Browser saber
ipcMain.handle('scanner:parseMetadata', async (_, paths: string[]) => {
  const items = [];
  
  for (const filePath of paths) {
    try {
      const metadata = await mm.parseFile(filePath);
      
      let coverArtUrl = undefined;
      const picture = metadata.common.picture?.[0];
      
      if (picture) {
         // Mandando array buffer the coverArt nativo como base64 pra não estourar payload IPC
         const base64 = picture.data.toString('base64');
         coverArtUrl = `data:${picture.format};base64,${base64}`;
      }

      // Passamos a URL baseada no Protocolo Injetado que criamos acima
      const audioUri = `musicos://${encodeURIComponent(filePath)}`;
      const fallbackTitle = path.basename(filePath, path.extname(filePath));

      items.push({
        id: crypto.randomUUID(),
        title: metadata.common.title || fallbackTitle,
        artist: metadata.common.artist || 'Artista Desconhecido',
        album: metadata.common.album || 'Álbum Desconhecido',
        duration: metadata.format.duration || 0,
        coverArt: coverArtUrl,
        uri: audioUri,
        provider: 'local',
        filePath: filePath,
        addedAt: Date.now()
      });
    } catch (err) {
      console.warn(`[Electron Backend Scanner] Falha binária e fallback para ${filePath}`, err);
      const audioUri = `musicos://${encodeURIComponent(filePath)}`;
      
      items.push({
        id: crypto.randomUUID(),
        title: path.basename(filePath, path.extname(filePath)),
        artist: 'Artista Desconhecido',
        album: 'Diversos',
        duration: 0,
        coverArt: undefined,
        uri: audioUri,
        provider: 'local',
        filePath: filePath,
        addedAt: Date.now()
      });
    }
  }
  
  return items;
});
