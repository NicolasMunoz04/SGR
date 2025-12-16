// Reserva.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const selectHabitacion = document.getElementById("habitacion");

  // Mapa de códigos -> título visible + grupo
  // (usá los códigos que mandás en los links ?habitacion=... desde Habitaciones.html)
  const META = {
    // Privadas
    standard:            { title: "Privada Standard",     group: "privada" },
    confort:             { title: "Privada Confort",      group: "privada" },
    superior:            { title: "Privada Superior",     group: "privada" },

    // Matrimoniales
    matrimonial_classic: { title: "Matrimonial Classic",  group: "matrimonial" },
    matrimonial_vista:   { title: "Matrimonial Vista",    group: "matrimonial" },
    matrimonial_deluxe:  { title: "Matrimonial Deluxe",   group: "matrimonial" },

    // Compartidas
    compartida_3_camas:  { title: "Compartida 3 Camas",   group: "compartida" },
    compartida_4_camas:  { title: "Compartida 4 Camas",   group: "compartida" },
    compartida_mixta:    { title: "Compartida Mixta",     group: "compartida" },
  };

  // Nombres por grupo (fallback si el usuario entra sin código)
  const NOMBRES_GRUPO = {
    privada: "Privada",
    matrimonial: "Matrimonial",
    compartida: "Compartida",
  };

  // --- Lee el parámetro ?habitacion=... ---
  const params = new URLSearchParams(window.location.search);
  const code = params.get("habitacion"); // p.ej. "confort", "matrimonial_classic", etc.

  // Preparar variables para el mensaje
  let tituloElegido = "";   // lo que verá el usuario (bonito)
  let codigoElegido = "";   // el código exacto
  let grupoElegido  = "";   // privada | matrimonial | compartida

  if (code && META[code]) {
    // Vino desde una card con un código conocido
    const meta = META[code];
    tituloElegido = meta.title;
    codigoElegido = code;
    grupoElegido  = meta.group;

    // Reemplazo el <select> por una única opción con el título bonito
    // y lo dejo deshabilitado para que no se pueda cambiar.
    if (selectHabitacion) {
      selectHabitacion.innerHTML = ""; // limpio opciones
      const opt = new Option(tituloElegido, codigoElegido, true, true);
      selectHabitacion.add(opt);
      selectHabitacion.disabled = true; // bloqueado

      // Como los inputs disabled no se envían, agrego hidden(s) con los valores
      const hiddenCode = document.createElement("input");
      hiddenCode.type  = "hidden";
      hiddenCode.name  = "habitacion";   // nombre de campo
      hiddenCode.value = codigoElegido;  // ej. "confort"
      selectHabitacion.parentNode.appendChild(hiddenCode);

      const hiddenGroup = document.createElement("input");
      hiddenGroup.type  = "hidden";
      hiddenGroup.name  = "grupo";
      hiddenGroup.value = grupoElegido;  // ej. "privada"
      selectHabitacion.parentNode.appendChild(hiddenGroup);
    }
  } else {
    // Entró sin código: se usa el select normal (por grupo)
    if (selectHabitacion) {
      const val = selectHabitacion.value;
      codigoElegido = val; // el grupo
      tituloElegido = NOMBRES_GRUPO[val] || (val ? (val[0].toUpperCase()+val.slice(1)) : "—");
      grupoElegido  = val;
    }
  }

  // --- Envío a WhatsApp ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre   = document.getElementById("nombre").value.trim();
    const email    = document.getElementById("email").value.trim();
    const checkin  = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

    // Si no vino código, tomar lo que esté en el select en ese momento
    if (!codigoElegido) {
      const val = selectHabitacion ? selectHabitacion.value : "";
      codigoElegido = val || "—";
      tituloElegido = NOMBRES_GRUPO[val] || (val ? (val[0].toUpperCase()+val.slice(1)) : "—");
      grupoElegido  = val || "—";
    }

    // Validación simple de fechas
    if (checkin && checkout && new Date(checkout) <= new Date(checkin)) {
      alert("⚠️ La fecha de salida debe ser posterior a la de ingreso.");
      return;
    }

    const mensaje =
`Hola, quiero reservar:
- Nombre: ${nombre || "—"}
- Correo: ${email || "—"}
- Habitación: ${tituloElegido || "—"} (${codigoElegido})
- Check-in: ${checkin || "—"}
- Check-out: ${checkout || "—"}`;

    const numero = "5492945651829";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  });
});