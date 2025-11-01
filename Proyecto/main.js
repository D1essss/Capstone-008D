// main.js

// Módulos para controlar la aplicación y crear ventanas
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Función que crea la ventana principal del navegador.
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      // Adjunta el script 'preload.js' a la ventana del navegador.
      // Este script actúa como un puente seguro.
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Carga la página de inicio de sesión inicial.
  win.loadFile(path.join(__dirname, 'html/iniciosesion.html'));
};

// Llama a createWindow() cuando la aplicación está lista.
app.whenReady().then(() => {
  require('update-electron-app')();
  createWindow();

  app.on('activate', () => {
    // En macOS, recrea la ventana si se hace clic en el ícono del dock.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on('navigate', (event, page) => {
  console.log('Paso 3: Main recibió el mensaje para navegar a:', page); // <-- Añade esta línea
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.loadFile(path.join(__dirname, `html/${page}`));
  }
});

// Cierra la aplicación cuando todas las ventanas se han cerrado (excepto en macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});