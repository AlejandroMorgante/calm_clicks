const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
  getState: () => ipcRenderer.invoke('overlay:get-state'),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('overlay:set-always-on-top', value),
  setClickThrough: (value) => ipcRenderer.invoke('overlay:set-click-through', value),
  quit: () => ipcRenderer.invoke('overlay:quit'),
  onState: (callback) => {
    ipcRenderer.on('overlay-state', (_event, state) => callback(state));
  },
});
