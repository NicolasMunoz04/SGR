// Disponibilidad.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-whatsapp-form');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const adultos = document.getElementById('adultos').value || 1;
    const ninos = document.getElementById('ninos').value || 0;

    if (!checkin || !checkout) {
      alert('Completá las fechas para enviar la consulta 🙂');
      return;
    }

    const numero = '5492945651829';
    const mensaje = `
    Hola, quiero consultar disponibilidad.
    Desde: ${checkin}
    Hasta: ${checkout}
    Adultos: ${adultos}
    Niños: ${ninos}
    `.trim();

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

  });
});