// js/nav-script.js
function handleNav(page, element) {
  // 1. Quita la clase 'active' de todos los links
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.remove('active');
  });

  // 2. Añade la clase 'active' solo al link que fue clickeado
  element.classList.add('active');

  // 3. Llama a la función de navegación que ya teníamos
  window.electronAPI.navigate(page);
}