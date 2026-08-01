const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zelvoDesktop', {
  getMeta: () => ipcRenderer.invoke('desktop:get-meta'),
  openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
  showSaveDialog: (options) => ipcRenderer.invoke('desktop:show-save-dialog', options),
});
