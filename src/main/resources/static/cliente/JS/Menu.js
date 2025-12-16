document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.createElement('button');
  const navLinks = document.querySelector('.nav-links');

  // Crear botón hamburguesa
  menuToggle.innerHTML = '☰';
  menuToggle.classList.add('menu-toggle');
  navbar.appendChild(menuToggle);

  // Toggle del menú en móviles
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Cambiar estilo del navbar al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});