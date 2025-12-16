document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form'); 
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // === Validación de formularios ===
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // Evita que se envíe automáticamente

      // Dependiendo del formulario, los campos pueden variar
      const nombre = document.getElementById('nombre')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password')?.value.trim();
      const password2 = document.getElementById('password2')?.value.trim();
      const adultos = document.getElementById('adultos')?.value;
      const ninos = document.getElementById('ninos')?.value;
      const checkin = document.getElementById('checkin')?.value;
      const checkout = document.getElementById('checkout')?.value;
      const habitacion = document.getElementById('habitacion')?.value;

      // Reglas de validación
      if (nombre !== undefined && !nombre) {
        alert('Por favor, ingresa tu nombre.');
        return;
      }

      if (email !== undefined && !email) {
        alert('Por favor, ingresa tu correo electrónico.');
        return;
      }

      if (password !== undefined && !password) {
        alert('Por favor, ingresa tu contraseña.');
        return;
      }

      if (password2 !== undefined && password !== password2) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      if (checkin !== undefined && checkout !== undefined) {
        if (!checkin || !checkout) {
          alert('Por favor, ingresa las fechas de llegada y salida.');
          return;
        }
        if (checkin >= checkout) {
          alert('La fecha de salida debe ser posterior a la de llegada.');
          return;
        }
      }

      if (adultos !== undefined && (isNaN(adultos) || adultos < 1)) {
        alert('Por favor, selecciona al menos un adulto.');
        return;
      }

      if (habitacion !== undefined && !habitacion) {
        alert('Por favor, selecciona un tipo de habitación.');
        return;
      }

      // Si todo está correcto
      alert('Formulario enviado correctamente ✅');
      form.reset();
    });
  }

  // === Toggle del menú en móviles ===
  if (toggle) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});