class EstablishmentConfig {
  constructor() {
      this.type = "hotel";
      this.name = "Mi Establecimiento";
      this.roomTerm = "Habitación";
      this.loadConfig();
  }

  loadConfig() {
      const saved = localStorage.getItem("establishmentConfig");
      if (saved) {
          const config = JSON.parse(saved);
          this.type = config.type || this.type;
          this.name = config.name || this.name;
          this.roomTerm = config.roomTerm || this.roomTerm;
      }
  }

  saveConfig() {
      const config = { type: this.type, name: this.name, roomTerm: this.roomTerm };
      localStorage.setItem("establishmentConfig", JSON.stringify(config));
  }

  updateUI() {
      const plural = this.getPluralTerm();
      const singular = this.roomTerm;

      // Header
      const establishmentNameEl = document.getElementById("establishmentName");
      if (establishmentNameEl) establishmentNameEl.textContent = this.name;

      // Títulos Sección
      const roomTermPluralEl = document.getElementById("roomTermPlural");
      if (roomTermPluralEl) roomTermPluralEl.textContent = plural;

      const roomTermSingularEl = document.getElementById("roomTermSingular");
      if (roomTermSingularEl) roomTermSingularEl.textContent = singular;

      const roomsListTitleEl = document.getElementById("roomsListTitle");
      if (roomsListTitleEl) roomsListTitleEl.textContent = `Lista de ${plural}`;

      // Títulos Modales
      const modalCrearLabel = document.getElementById("modalCrearLabel");
      if (modalCrearLabel) modalCrearLabel.textContent = `Crear ${singular}`;

      const modalEditarDetallesLabel = document.getElementById("modalEditarDetallesLabel");
      if (modalEditarDetallesLabel) modalEditarDetallesLabel.textContent = `Editar Detalles ${singular}`;

      const modalVerDetallesLabel = document.getElementById("modalVerDetallesLabel");
      if (modalVerDetallesLabel) modalVerDetallesLabel.textContent = `Detalles de ${singular}`;

      const modalEliminarLabel = document.getElementById("modalEliminarLabel");
      if (modalEliminarLabel) modalEliminarLabel.textContent = `Eliminar ${singular}`;
  }

  getPluralTerm() {
      if (this.roomTerm.endsWith("ón")) return this.roomTerm.slice(0, -2) + "ones";
      if (this.roomTerm.endsWith("z")) return this.roomTerm.slice(0, -1) + "ces";
      if (this.roomTerm.match(/[aeiou]$/i)) return this.roomTerm + "s";
      return this.roomTerm + "es";
  }

  setPreset(type) {
      const presets = {
          hotel: { name: "Hotel 5 Bits", roomTerm: "Habitación" },
          hostel: { name: "Hostel Viajero", roomTerm: "Cama" },
          cabañas: { name: "Cabañas del Bosque", roomTerm: "Cabaña" },
          apartamentos: { name: "Apartamentos Modernos", roomTerm: "Apartamento" },
          posada: { name: "Posada del Camino", roomTerm: "Habitación" },
      };
      if (presets[type]) {
          this.type = type;
          this.name = presets[type].name;
          this.roomTerm = presets[type].roomTerm;
      }
  }
}

// Función global para reemplazar los alert() por SweetAlert2
function showAlert(title, text = "", icon = "info") {
    
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Aceptar",
      background: "#f9f9f9",
      color: "#333",
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

// Inicialización y carga de check-in / check-out
document.addEventListener("DOMContentLoaded", async () => {
  const config = new EstablishmentConfig();
  config.updateUI();

  // URL DINÁMICA
  const API_BASE_URL = window.location.origin;

  // Cargar check-ins
  try {
      // CAMBIADO: Antes decía http://localhost:8080
      const responseIn = await fetch(`${API_BASE_URL}/reservas/checkin`);
      const checksIn = await responseIn.json();
      listarHabitacionesin(checksIn);
  } catch (error) {
    showAlert("Error", "No se pudo iniciar la búsqueda de check-in", "warning")
      console.error(error);
  }

  // Cargar check-outs
  try {
      // CAMBIADO: Antes decía http://localhost:8080
      const responseOut = await fetch(`${API_BASE_URL}/reservas/checkout`);
      const checksOut = await responseOut.json();
      listarHabitacionesout(checksOut);
  } catch (error) {
      console.error(error);
      showAlert("Error", "No se pudo iniciar la búsqueda de check-out", "warning")
  }
});

// Listar check-ins
function listarHabitacionesin(checks) {
  const tbody = document.querySelector("#results-body-in");
  tbody.innerHTML = "";
  checks.forEach(check => {
      const row = `
      <tr>
          <td>${check.nombreCliente}</td>
          <td>${check.apellidoCliente}</td>
          <td>${check.numeroHabitacion}</td>
          <td>${check.fechaEntrada}</td>
          <td>${check.fechaSalida}</td>
          <td>${check.montoTotal}$</td>
          <td>${check.senia}$</td>
          <td>${check.pagoRealizado}$</td>
          <td>${check.debe}$</td>
          <td>
              <button class="checkin-btn" data-id="${check.reservaId}">Check-in</button>
          </td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
  });
}

// Listar check-outs
function listarHabitacionesout(checks) {
  const tbody = document.querySelector("#results-body-out");
  tbody.innerHTML = "";
  checks.forEach(check => {
      const row = `
      <tr>
          <td>${check.nombreCliente}</td>
          <td>${check.apellidoCliente}</td>
          <td>${check.numeroHabitacion}</td>
          <td>${check.fechaEntrada}</td>
          <td>${check.fechaSalida}</td>
          <td>${check.montoTotal}$</td>
          <td>${check.senia}$</td>
          <td>${check.pagoRealizado}$</td>
          <td>${check.debe}$</td>
          <td>
              <button class="checkout-btn" data-id="${check.reservaId}">Check-out</button>
          </td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
  });
}
