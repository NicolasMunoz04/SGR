document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contacto");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Evita que se envíe el formulario normal

    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let mensaje = document.getElementById("mensaje").value;

    // Número de WhatsApp
    let numero = "542945651829";

    // Armamos el mensaje
    let url =
      "https://wa.me/" +
      numero +
      "?text=" +
      encodeURIComponent(
        `Hola, soy ${nombre} (${email}).\nQuiero hacer esta consulta:\n${mensaje}`
      );

    // Abrimos WhatsApp en una nueva pestaña
    window.open(url, "_blank");
  });
});