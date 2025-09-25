// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (page) => {
  console.log('Paso 2: Preload recibió el mensaje para navegar a:', page);
  ipcRenderer.send('navigate', page);
}
});