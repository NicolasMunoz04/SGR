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
        if (roomTermSingularEl) roomTermSingularEl.textContent = singular; // Para el botón 'Nueva X'
        const roomsListTitleEl = document.getElementById("roomsListTitle");
        if (roomsListTitleEl) roomsListTitleEl.textContent = `Lista de ${plural}`;
        // Títulos Modales (Asegúrate que los IDs coincidan)
        const modalCrearLabel = document.getElementById("modalCrearLabel"); // ID actualizado en HTML
        if (modalCrearLabel) modalCrearLabel.textContent = `Crear ${singular}`;
        const modalEditarDetallesLabel = document.getElementById("modalEditarDetallesLabel"); // ID actualizado en HTML
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
  

/* ====================================================== */
/* LÓGICA DE SPRING BOOT (habitaciones.js)         */
/* ====================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    

    const API_BASE_URL = "http://localhost:8080"; // URL base de tu API

    // --- 1. INICIALIZAR PERSONALIZACIÓN ---
    const config = new EstablishmentConfig();
    const customNameInput = document.getElementById("customName");
    const roomTermInput = document.getElementById("roomTerm");
    const establishmentTypeSelect = document.getElementById("establishmentType");
    if (customNameInput) customNameInput.value = config.name;
    if (roomTermInput) roomTermInput.value = config.roomTerm;
    if (establishmentTypeSelect) establishmentTypeSelect.value = config.type;
    config.updateUI();
    

    // --- 2. LISTENERS CONFIGURACIÓN ---
    if (establishmentTypeSelect) {
        establishmentTypeSelect.addEventListener("change", (e) => {
            config.setPreset(e.target.value);
            if (customNameInput) customNameInput.value = config.name;
            if (roomTermInput) roomTermInput.value = config.roomTerm;
            // No es necesario actualizar la UI aquí, applyConfig lo hará
        });
    }
    const applyConfigBtn = document.getElementById("applyConfig");
    if (applyConfigBtn) {
        applyConfigBtn.addEventListener("click", () => {
            const customName = customNameInput ? customNameInput.value.trim() : config.name;
            const roomTerm = roomTermInput ? roomTermInput.value.trim() : config.roomTerm;
            if (customName) config.name = customName;
            if (roomTerm) config.roomTerm = roomTerm;
            config.saveConfig();
            config.updateUI(); // Actualiza textos
            // Feedback visual (opcional)
            
        });
    }

    // --- 3. LÓGICA DE HABITACIONES ---
    const selectTipo = document.getElementById("newTipoHab");
    const nuevoTipoContainer = document.getElementById("nuevoTipoContainer");
    const btnCrearTipo = document.getElementById("btnCrearTipo");
    const formHabitacion = document.getElementById("formHabitacion");
    const roomsContainer = document.getElementById("roomsContainer");

    // Instancias de Modales Bootstrap (para control programático)
    const modalCrear = document.getElementById('modalCrearHabitacion') ? new bootstrap.Modal(document.getElementById('modalCrearHabitacion')) : null;
    const modalVerDetalles = document.getElementById('modalVerDetalles') ? new bootstrap.Modal(document.getElementById('modalVerDetalles')) : null;
    const modalEditarDetalles = document.getElementById('modalEdittHabitacion') ? new bootstrap.Modal(document.getElementById('modalEdittHabitacion')) : null;
    const modalEliminar = document.getElementById('modalEliminarHabitacion') ? new bootstrap.Modal(document.getElementById('modalEliminarHabitacion')) : null;


    // ======================================================
    //     ¡CÓDIGO AÑADIDO!
    // ======================================================
    // Listener para mostrar/ocultar el formulario de nuevo tipo
    if (selectTipo && nuevoTipoContainer) {
        selectTipo.addEventListener("change", () => {
            if (selectTipo.value === "nuevo") {
                // Si el usuario selecciona "Crear nuevo tipo", muestra el contenedor
                nuevoTipoContainer.style.display = "block";
            } else {
                // Si selecciona cualquier otra cosa, lo oculta
                nuevoTipoContainer.style.display = "none";
            }
        });
    }
    // ======================================================
    //     FIN CÓDIGO AÑADIDO
    // ======================================================


    // --- Carga Inicial de Tipos ---
    async function cargarTiposHabitacion() {
        if (!selectTipo) return;
        try {
            const res = await fetch(`${API_BASE_URL}/tipos/listar`);
            if (!res.ok) throw new Error("No se pudieron cargar los tipos");
            const tipos = await res.json();

            // Limpiar opciones excepto las por defecto
            const optionsToKeep = selectTipo.querySelectorAll('option[value=""], option[value="nuevo"]');
            selectTipo.innerHTML = ''; // Limpiar todo
            optionsToKeep.forEach(opt => selectTipo.appendChild(opt)); // Re-añadir las por defecto

            tipos.forEach((tipo) => {
                const option = document.createElement("option");
                option.value = tipo.tipoId;
                option.textContent = tipo.nombre;
                selectTipo.insertBefore(option, selectTipo.options[selectTipo.options.length - 1]); // antes del "nuevo"
            });
        } catch (error) {
            showAlert("Error", "No se pudieron cargar los tipos de habitación.", "error");
            // Podrías añadir un mensaje en el select
            selectTipo.innerHTML = '<option value="">Error al cargar tipos</option>';
        }
    }

    //Crear nuevo tipo de habitación
    btnCrearTipo.addEventListener("click", async () => {
        // Obtener valores de los inputs
        const nombreInput = document.getElementById("nombreTipoHab");
        const descripcionInput = document.getElementById("descripcionTipoHab");
        const capacidadInput = document.getElementById("capacidadTipoHab"); // <-- Input nuevo

        const nombre = nombreInput.value.trim();
        const descripcion = descripcionInput.value.trim();
        const capacidadMaxima = capacidadInput.value.trim(); // <-- Valor nuevo

        // Validación (ahora incluye capacidad)
        if (!nombre || !descripcion || !capacidadMaxima) {
            showAlert("Campos incompletos", "Completá Nombre, Descripción y Capacidad Máxima.", "warning");
            return;
        }

        const capacidadNum = parseInt(capacidadMaxima, 10);
        if (isNaN(capacidadNum) || capacidadNum <= 0) {
            showAlert("Dato inválido", "La Capacidad Máxima debe ser un número positivo.", "error");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/tipos/crearTipo`, { // Usar API_BASE_URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Enviar todos los datos al backend
                body: JSON.stringify({ nombre, descripcion, capacidadMaxima: capacidadNum }),
            });

            if (!res.ok) {
                // Intentar leer el mensaje de error del backend si existe
                let errorMsg = "Error al crear tipo";
                try {
                    const errorData = await res.text();
                    if (errorData) {
                        errorMsg += `: ${errorData}`;
                    }
                } catch (e) {
                    // No hacer nada si no se puede leer el cuerpo del error
                }
                throw new Error(errorMsg);
            }


            const nuevoTipo = await res.json();

            //Agregar nuevo tipo al select
            const option = document.createElement("option");
            option.value = nuevoTipo.tipoId;
            option.textContent = nuevoTipo.nombre;

            // Buscar la opción "Crear nuevo tipo" para insertar antes de ella
            const opcionNuevo = selectTipo.querySelector('option[value="nuevo"]');
            if (opcionNuevo) {
                selectTipo.insertBefore(option, opcionNuevo);
            } else {
                // Si por alguna razón no está la opción "nuevo", añadir al final
                selectTipo.appendChild(option);
            }
            selectTipo.value = nuevoTipo.tipoId; // Seleccionar el nuevo tipo creado

            //Ocultar formulario y limpiar campos (ahora incluye capacidad)
            nuevoTipoContainer.style.display = "none";
            nombreInput.value = "";
            descripcionInput.value = "";
            capacidadInput.value = ""; // <-- Limpiar campo nuevo

            showAlert("Éxito", "Tipo creado y seleccionado correctamente", "success");

        } catch (error) {
            console.error("Error en fetch para crear tipo:", error);
            showAlert("Error", `Error al crear el tipo de habitación: ${error.message}`, "error");
        }
    });

    // --- Lógica Crear Habitación ---
    if (formHabitacion) {
        formHabitacion.addEventListener("submit", async (e) => {
            e.preventDefault();
            const tipoId = selectTipo.value;
            if (!tipoId || tipoId === "nuevo") {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "¡Debe seleccionar un tipo de habitación válido!"})
                                     return;
            }
            const datosRegistro = {
                numero: document.getElementById("newNumeroHab").value,
                precio: document.getElementById("newPrecioHab").value,
                tipoId: Number(tipoId),
                // El estado por defecto ('Disponible') se asigna en el backend
            };
            try {
                const res = await fetch(`${API_BASE_URL}/habitaciones/crear`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    // Authorization: "Basic " + btoa("admin:admin"), // Si necesitas autenticación
                    body: JSON.stringify(datosRegistro),
                });
                // Manejar respuesta no OK (ej. habitación duplicada)
                if (!res.ok) {
                    const errorData = await res.text(); // O .json() si tu backend devuelve JSON
                    throw new Error(errorData || "Error al guardar habitación");
                }
                await res.json(); // O simplemente verificar res.ok si no necesitas la respuesta
                showAlert("¡Perfecto!", `${config.roomTerm} creada con éxito `, "success");
                if (modalCrear) modalCrear.hide();
                formHabitacion.reset(); selectTipo.value = ""; // Resetear select
                await cargarHabitaciones(); // Recargar lista
            } catch (err) {
                Swal.fire ({icon: "error", title:"Oops...",text:"Por favor, completa los campos."});
               // si hay un error descomentar, opcion dev. showAlert("Error", `Error al guardar: ${err.message}`, "error");
            }
        });
    }

    // --- Cargar y Listar Habitaciones ---
    async function cargarHabitaciones() {
        if (!roomsContainer) return;
        // Mostrar placeholders mientras carga (se mantiene el original, no afecta el CSS)
        roomsContainer.innerHTML = `
            <div class="col"> <div class="card h-100 placeholder-glow"><div class="card-body text-center"><span class="placeholder col-6"></span> <span class="placeholder col-8"></span> <span class="placeholder col-4"></span> <div class="mt-2"><span class="placeholder-button col-4"></span> <span class="placeholder-button col-4"></span> <span class="placeholder-button col-3"></span></div></div></div> </div>
            <div class="col"> <div class="card h-100 placeholder-glow"><div class="card-body text-center"><span class="placeholder col-6"></span> <span class="placeholder col-8"></span> <span class="placeholder col-4"></span> <div class="mt-2"><span class="placeholder-button col-4"></span> <span class="placeholder-button col-4"></span> <span class="placeholder-button col-3"></span></div></div></div> </div>
            <div class="col"> <div class="card h-100 placeholder-glow"><div class="card-body text-center"><span class="placeholder col-6"></span> <span class="placeholder col-8"></span> <span class="placeholder col-4"></span> <div class="mt-2"><span class="placeholder-button col-4"></span> <span class="placeholder-button col-4"></span> <span class="placeholder-button col-3"></span></div></div></div> </div>
             <div class="col"> <div class="card h-100 placeholder-glow"><div class="card-body text-center"><span class="placeholder col-6"></span> <span class="placeholder col-8"></span> <span class="placeholder col-4"></span> <div class="mt-2"><span class="placeholder-button col-4"></span> <span class="placeholder-button col-4"></span> <span class="placeholder-button col-3"></span></div></div></div> </div>
        `;
        try {
            const response = await fetch(`${API_BASE_URL}/habitaciones/listar`);
            if (!response.ok) throw new Error("Error al cargar habitaciones");
            const habitaciones = await response.json();
            listarHabitaciones(habitaciones);
        } catch (error) {
            showAlert("Error", `Error al cargar habitaciones: ${error.message}`, "error");
           
            roomsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error al cargar ${config.getPluralTerm()}. Intente de nuevo.</div></div>`;
        }
    }

    // --- FUNCIÓN MODIFICADA ---
    function listarHabitaciones(hab) {
        if (!roomsContainer) return;
        roomsContainer.innerHTML = ""; // Limpiar placeholders o contenido anterior
        if (!hab || hab.length === 0) {
            roomsContainer.innerHTML = `<div class="col-12"><p class="text-center text-muted">No hay ${config.getPluralTerm().toLowerCase()} para mostrar.</p></div>`;
            return;
        }

        hab.forEach((element) => {
            const estado = element.estado || "Disponible";
            // Mapeo de estados a clases CSS (ej: "En Mantenimiento" -> "mantenimiento")
            let estadoClass = estado.toLowerCase().replace(' ', '-');

            // Mapeamos 'reservada' a 'mantenimiento' para que use el estilo naranja, como en el CSS
            if (estadoClass === 'reservada') {
                estadoClass = 'mantenimiento';
            }


            const precioFormateado = element.precio ? `$${Number(element.precio).toLocaleString('es-AR')}` : '';

            // El div wrapper (reemplaza .col de Bootstrap)
            const cardWrapper = document.createElement('div');

            // --- INICIO: HTML MODIFICADO ---
            // Este HTML SÍ coincide con las clases de habitaciones.css y la imagen
            cardWrapper.innerHTML = `
                <div class="room ${estadoClass}" data-room-id="${element.habitacionId}">

                    <h3>${element.tipoNombre || 'Tipo no especificado'}</h3>

                    <p class="capacity"> ${element.numero}</p>

                    <p class="room-info">${precioFormateado}</p>

                    <div>
                        <span class="status">${estado}</span>
                    </div>

                    <div class="room-actions">
                        <button class="btn-icon btn-details btn-ver-detalles" data-room="${element.habitacionId}" title="Ver Detalles">
                            <i class="fa-solid fa-clipboard"></i>
                        </button>
                        <button class="btn-icon btn-edit btn-editar-hab" data-room="${element.habitacionId}" title="Editar">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn-icon btn-delete btn-eliminar-hab" data-room="${element.habitacionId}" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>`;
            // --- FIN: HTML MODIFICADO ---

            roomsContainer.appendChild(cardWrapper);
        });
    }
    // --- FIN FUNCIÓN MODIFICADA ---


    function getEstadoBadgeColor(estado) {
        switch (estado?.toLowerCase()) {
            case 'disponible': return 'success';
            case 'ocupada': return 'danger';
            case 'reservada': return 'primary'; // Azul para reservada?
            case 'mantenimiento': return 'secondary';
            default: return 'light text-dark';
        }
    }


    // --- Lógica Modales (Ver, Editar, Eliminar) ---

    // NUEVO: Abrir Modal Ver Detalles
    async function abrirModalVerDetalles(idHabitacion) {
        if (!modalVerDetalles) return;
        // Referencias a elementos del modal de detalles
        const detalleNumero = document.getElementById("detalleNumero");
        const detalleTipo = document.getElementById("detalleTipo");
        const detalleDescripcion = document.getElementById("detalleDescripcion");
        const detallePrecio = document.getElementById("detallePrecio");
        const detalleEstado = document.getElementById("detalleEstado");
        const detalleOcupacionDiv = document.getElementById("detalleOcupacion");

        // Mostrar 'cargando'
        detalleNumero.textContent = '...';
        detalleTipo.textContent = '...';
        detalleDescripcion.textContent = '...'; // Limpiamos descripción también
        detallePrecio.textContent = '...';
        detalleEstado.textContent = 'Cargando...';
        detalleEstado.className = 'badge bg-secondary'; // Reset class
        detalleOcupacionDiv.innerHTML = '<p class="text-muted">Cargando ocupación...</p>';

        modalVerDetalles.show();

        try {
            // 1. Obtener detalles de la habitación
            const resHab = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`);
            if (!resHab.ok) throw new Error("No se pudo cargar la habitación");
            const hab = await resHab.json();

            // Llenar detalles de la habitación
            detalleNumero.textContent = hab.numero;
            
            // --- ¡CORRECCIÓN APLICADA! ---
            // Leemos los campos "planos" (tipoNombre, tipoDescripcion) 
            // que envía el backend, en lugar de los campos anidados (tipo.nombre)
            detalleTipo.textContent = hab.tipoNombre || 'N/A';
            detalleDescripcion.textContent = hab.tipoDescripcion || 'Sin descripción.';
            // --- FIN CORRECCIÓN ---

            detallePrecio.textContent = hab.precio?.toFixed(2) || 'N/A';
            detalleEstado.textContent = hab.estado || 'N/A';
            detalleEstado.className = `badge bg-${getEstadoBadgeColor(hab.estado)}`;

            // 2. Si está Ocupada o Reservada, buscar reserva actual
            // (Esta lógica ya estaba correcta)
            if (hab.estado === 'ocupada' || hab.estado === 'Reservada') {
                try {
                    // Asume que tienes este endpoint: GET /reservas/habitacion/actual/{idHabitacion}
                    const resReserva = await fetch(`${API_BASE_URL}/reservas/habitacion/actual/${idHabitacion}`);
                    if (resReserva.ok) {
                        const reserva = await resReserva.json();
                        // Mostrar datos del cliente y fechas
                        detalleOcupacionDiv.innerHTML = `
                            <h3>Datos de huésped</h3>
                            <p><strong>Huésped:</strong> ${reserva.cliente?.nombre || ''} ${reserva.cliente?.apellido || ''}</p>
                            <p><strong>Check-in:</strong> ${reserva.fechaInicio || 'N/A'}</p>
                            <p><strong>Check-out:</strong> ${reserva.fechaFin || 'N/A'}</p>
                            <p><strong>Personas:</strong> ${reserva.cantidadPersonas || 'N/A'}</p>
                            <p><strong>Estado Reserva:</strong> <span class="badge bg-${getEstadoBadgeColor(reserva.estado)}">${reserva.estado || 'N/A'}</span></p>
                        `;
                    } else {
                        detalleOcupacionDiv.innerHTML = '<p class="text-warning small">No se encontró una reserva activa para esta habitación.</p>';
                    }
                } catch (errorReserva) {
                    showAlert("No hay personas hospedadas", `Error al buscar reserva activa`, "error");
                    detalleOcupacionDiv.innerHTML = '<p class="text-danger small">Error al cargar datos de ocupación.</p>';
                }
            } else {
                // Si el estado es "Disponible" o "Mantenimiento", muestra este mensaje
                detalleOcupacionDiv.innerHTML = `<p class="text-success">${config.roomTerm} ${hab.estado}.</p>`;
            }

        } catch (error) {
            showAlert("Error", `Error al abrir el modal: ${error}`, "error");
            // Mostrar error en el modal
            document.getElementById("detalleHabitacionContenido").innerHTML = `<div class="alert alert-danger">Error al cargar detalles: ${error.message}</div>`;
        }
    }
    


    // MODIFICADO: Abrir Modal Editar Detalles
    async function abrirModalEditarDetalles(idHabitacion) {
        if (!modalEditarDetalles) return;
        // Referencias a elementos del modal de edición
        const editHabIdInput = document.getElementById("editHabitacionId");
        const editNumeroInput = document.getElementById("editNumeroHab");
        const editPrecioInput = document.getElementById("editPrecioHab");
        const editEstadoSelect = document.getElementById("editEstadoHabDetalle");

        // Resetear y mostrar cargando
        editHabIdInput.value = '';
        editNumeroInput.value = '';
        editPrecioInput.value = '';
        editEstadoSelect.innerHTML = '<option value="">Cargando...</option>';

        modalEditarDetalles.show(); // Mostrar modal antes de fetch

        try {
            // 1. Cargar estados posibles (si no están cargados)
            if (editEstadoSelect.options.length <= 1 || editEstadoSelect.options[0].value === "") {
                await cargarEstadosHabitacionEditar(); // Carga los estados en el select
            }

            // 2. Obtener detalles actuales de la habitación
            const res = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`);
            if (!res.ok) throw new Error("No se pudo cargar la habitación para editar");
            const hab = await res.json();

            // Llenar formulario
            editHabIdInput.value = hab.habitacionId;
            editNumeroInput.value = hab.numero;
            editPrecioInput.value = hab.precio;
            editEstadoSelect.value = hab.estado; // Seleccionar estado actual

        } catch (error) {
            console.error(error);
            showAlert("Error", `Error al cargar datos para editar: ${error}`, "error");
            modalEditarDetalles.hide(); // Ocultar si falla la carga
        }
    }

    // NUEVO: Cargar estados de habitación al select del modal de edición
    async function cargarEstadosHabitacionEditar() {
        const selectEstado = document.getElementById("editEstadoHabDetalle");
        if (!selectEstado) return;
        try {
            const response = await fetch(`${API_BASE_URL}/enums/estadosHabitacion`);
            if (!response.ok) throw new Error("Error al obtener estados");
            const estados = await response.json();

            selectEstado.innerHTML = '<option value="">Seleccione estado...</option>'; // Limpiar
            estados.forEach((estado) => {
                const option = document.createElement("option");
                option.value = estado;
                option.textContent = estado;
                selectEstado.appendChild(option);
            });
        } catch (error) {
            showAlert("Error", `No se pudo cargar la lista de estados: ${error}`, "error");
            selectEstado.innerHTML = '<option value="">Error al cargar</option>';
        }
    }


    // para Guardar Cambios (Editar Detalles)
    const formEdittHabitacion = document.getElementById("formEdittHabitacion");
    if (formEdittHabitacion) {
        formEdittHabitacion.addEventListener("submit", async (e) => {
            e.preventDefault();
            const idHabitacion = document.getElementById("editHabitacionId").value;
            if (!idHabitacion) return;

            const datosActualizados = {
                numero: document.getElementById("editNumeroHab").value.trim(),
                precio: document.getElementById("editPrecioHab").value.trim(), // Enviar como string, el backend convierte
                estado: document.getElementById("editEstadoHabDetalle").value,
                // tipoId: null // Si quisieras cambiar el tipo, necesitarías un select y enviar tipoId
            };

            // Validación simple
            if (!datosActualizados.numero || !datosActualizados.precio || !datosActualizados.estado) {
                showAlert("Campos incompletos", "Por favor, complete todos los campos.", "warning");
                return;
            }

            try {
                // Asume que tienes este endpoint: PUT /habitaciones/modificar/{id}
                const res = await fetch(`${API_BASE_URL}/habitaciones/modificar/${idHabitacion}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosActualizados),
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error al modificar habitación");
                }
                // Si el backend devuelve la habitación actualizada: const habActualizada = await res.json();
                
                showAlert("Éxito", `${config.roomTerm} Modificada correctamente`, "success");
                if (modalEditarDetalles) modalEditarDetalles.hide();
                await cargarHabitaciones(); // Recargar lista
            } catch (error) {
                console.error(error);
                showAlert("Error", `No se pudo modificar: ${error.message}`, "error");
            }
        });
    }

    // NUEVO: Abrir Modal de Confirmación para Eliminar
    function abrirModalEliminar(idHabitacion, nombreHabitacion) {
        if (!modalEliminar) return;
        document.getElementById("habitacionAEliminarId").value = idHabitacion;
        document.getElementById("nombreHabitacionAEliminar").textContent = nombreHabitacion || `ID ${idHabitacion}`;
        console.log(idHabitacion)
        modalEliminar.show();
    }


    // MODIFICADO: Listener para Confirmar Eliminación
    const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener("click", async () => {
            const idHabitacion = document.getElementById("habitacionAEliminarId").value;
            if (!idHabitacion) return;

            try {
                // Asume que tienes este endpoint: DELETE /habitaciones/eliminar/{id}
                const res = await fetch(`${API_BASE_URL}/habitaciones/eliminar/${idHabitacion}`, {
                    method: "DELETE",
                });
                // DELETE exitoso a menudo devuelve 204 No Content
                if (!res.ok && res.status !== 204) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error al eliminar habitación");
                }
                showAlert("Éxito", `${config.roomTerm} eliminada correctamente`, "success");
                if (modalEliminar) modalEliminar.hide();
                await cargarHabitaciones(); // Recargar lista
            } catch (error) {
                console.error(error);
                showAlert("Error", `No se puede eliminar habitaciones que cuentan con reservas agendadas. Elimine todas las reservas relacionada con esta habitación`, "error");
                if (modalEliminar) modalEliminar.hide(); // Ocultar modal incluso si hay error
            }
        });
    }


    // --- BLOQUE MODIFICADO ---
    // --- Listener Principal en Contenedor de Habitaciones (MODIFICADO) ---
    if (roomsContainer) {
        roomsContainer.addEventListener("click", (e) => {
            const target = e.target;

            // MODIFICADO: Buscamos la tarjeta .room en lugar de .room-card
            const card = target.closest('.room');
            if (!card) return; // Salir si no se hizo clic dentro de una tarjeta .room

            const btnVer = target.closest('.btn-ver-detalles');
            const btnEditar = target.closest('.btn-editar-hab');
            const btnEliminar = target.closest('.btn-eliminar-hab');

            if (btnVer) {
                const idHabitacion = btnVer.dataset.room;
                abrirModalVerDetalles(idHabitacion);
            } else if (btnEditar) {
                const idHabitacion = btnEditar.dataset.room;
                abrirModalEditarDetalles(idHabitacion);
            } else if (btnEliminar) {
                const idHabitacion = btnEliminar.dataset.room;

                // MODIFICADO: Obtenemos el título desde el <h3> dentro de la tarjeta
                const nombreHab = card.querySelector('h3')?.textContent || `ID ${idHabitacion}`;
                abrirModalEliminar(idHabitacion, nombreHab);
            }
        });
    }

    // --- Inicialización ---
    async function init() {
        await cargarTiposHabitacion(); // Cargar tipos para el modal de crear
        await cargarHabitaciones();     // Cargar y mostrar habitaciones
        cargarEstadosHabitacionEditar(); // Precargar estados para modal editar
    }

    init();

});

