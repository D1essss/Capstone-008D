// main.js

// 1. Módulos para controlar la aplicación
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// 2. LA GUARDIA DE SQUIRREL (¡DEBE ESTAR AQUÍ!)
// Maneja los eventos de instalación/desinstalación de Squirrel en Windows
// ANTES de que la app haga cualquier otra cosa.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// 3. Función que crea la ventana principal del navegador.
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Carga la página de inicio de sesión inicial.
  win.loadFile(path.join(__dirname, 'html/iniciosesion.html'));
};

// 4. Llama a createWindow() CUANDO la app está lista.
app.whenReady().then(() => {
  require('update-electron-app')();

  // 6. Creamos la ventana
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 7. Navegación (esto está perfecto)
ipcMain.on('navigate', (event, page) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.loadFile(path.join(__dirname, `html/${page}`));
  }
});

// 8. Cierre de la app (esto está perfecto)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});