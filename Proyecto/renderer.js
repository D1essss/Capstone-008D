// js/renderer.js
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      console.log('Paso 1: Botón clickeado desde renderer.js');
      window.electronAPI.navigate('index.html');
    });
  }
});