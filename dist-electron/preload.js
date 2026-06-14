import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
	openFolder: () => ipcRenderer.invoke("dialog:openFolder"),
	parseMetadata: (paths) => ipcRenderer.invoke("scanner:parseMetadata", paths)
});
//#endregion
export {};
