// electron/preload.cjs
const { contextBridge, ipcRenderer  } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendHeartbeat: () => ipcRenderer.send('heartbeat-from-frontend'),

  onBackendHeartbeat: (callback) => {
    ipcRenderer.on('heartbeat-from-backend', (_, msg) => callback(msg));
  },

  getScreenSources: (data) => ipcRenderer.send('get-screen'),

  sendKeyboardInput: (key) => ipcRenderer.send('keyboard-input', key),
  sendMouseInput: (type, data) => ipcRenderer.send('mouse-input', { type, data })
});