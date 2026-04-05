/**
 * APP INIT — punto de entrada principal
 */
document.addEventListener('DOMContentLoaded', () => {
  // Scroll header shadow
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Inicializar productos (async: carga el Sheet y renderiza)
  initProductos();
});
