
import { app, BrowserWindow, ipcMain, dialog,require } from 'electron';
import { error } from 'node:console';
import { join } from 'node:path';

if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
const win = new BrowserWindow({
 width: 1000,
 height: 800,
 webPreferences: {
 preload: join(__dirname, 'preload.js')
}
 });
win.loadFile(join(__dirname, 'html/iniciosesion.html'));
};

app.whenReady().then(() => {
createWindow();
  try {
    console.log('Intentando iniciar el actualizador...' );
    require('update-electron-app')();
    console.log('Actualizador iniciado con éxito.'); 
    console.log('Buscando actualizaciones en segundo plano...');
    console.log('Actualizador iniciado con éxito.');
  } catch (error) {
    console.error('Error al iniciar el auto-actualizador:', error);
    dialog.showErrorBox(
      'Error del Auto-Actualizador',
      'No se pudo iniciar el módulo de actualización. Por favor, reporta este error:\n\n' + error.message
    );
  }


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
 win.loadFile(join(__dirname, `html/${page}`));
 }
});

// 8. Cierre de la app (esto está perfecto)
app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
 app.quit();
}
});