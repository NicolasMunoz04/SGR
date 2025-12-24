document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    //  ALERTAS SWEETALERT2
    // -----------------------------
    function showAlert(title, text = "", icon = "info") {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                title,
                text,
                icon,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Aceptar",
                background: "#f9f9f9",
                color: "#333",
                showClass: { popup: "animate__animated animate__fadeInDown" },
                hideClass: { popup: "animate__animated animate__fadeOutUp" }
            });
        } else {
            alert(title + "\n\n" + text);
        }
    }

    // Acá tambien agregue la URL dinámica
    const API_BASE_URL = window.location.origin;
    
    let reservasEncontradas = [];
    let todasLasHabitaciones = [];

    // -----------------------------
    //  SELECTORES DEL DOM
    // -----------------------------
    const searchNombreInput = document.getElementById("searchNombre");
    const searchApellidoInput = document.getElementById("searchApellido");
    const searchFechaDesdeInput = document.getElementById("searchFechaDesde");
    const searchFechaHastaInput = document.getElementById("searchFechaHasta");
    const btnBuscar = document.getElementById("btnBuscar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const resultsBody = document.getElementById("results-body");
    const errorsContainer = document.getElementById("errors-container");

    // Modal edición
    const modalEditarElement = document.getElementById("modalEditarReserva");
    const modalEditar = modalEditarElement ? new bootstrap.Modal(modalEditarElement) : null;
    const formEditar = document.getElementById("formEditar");
    const reservaIdInput = document.getElementById("reservaId");
    const editNombreInput = document.getElementById("editNombre");
    const editApellidoInput = document.getElementById("editApellido");
    const editEmailInput = document.getElementById("editEmail");
    const editTelefonoInput = document.getElementById("editTelefono");
    const editHabitacionSelect = document.getElementById("editHabitacion");
    const editCantidadPersonasInput = document.getElementById("editCantidadPersonas");
    const editFechaInicioInput = document.getElementById("editFechaInicio");
    const editFechaFinInput = document.getElementById("editFechaFin");
    const editEstadoSelect = document.getElementById("editEstado");

    // -----------------------------
    //  FUNCIONES AUXILIARES
    // -----------------------------
    function mostrarMensaje(m, tipo = "danger") {
        if (!errorsContainer) return;
        errorsContainer.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${m}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
    }

    function limpiarMensajes() {
        if (errorsContainer) errorsContainer.innerHTML = "";
    }

    // -----------------------------
    //  BUSCAR RESERVAS (DEFINITIVO)
    // -----------------------------
   async function buscarReservas() {
    limpiarMensajes();

    const nombre = searchNombreInput.value.trim().toLowerCase();
    const apellido = searchApellidoInput.value.trim().toLowerCase();
    //const fechaDesde = searchFechaDesdeInput.value;
    //const fechaHasta = searchFechaHastaInput.value;

    const params = new URLSearchParams();

    // Validación de campos vacíos
    // antes o && !fechaDesde && !fechaHasta
    if (!nombre && !apellido) {
        mostrarMensaje("Por favor, ingrese al menos un criterio de búsqueda.", "warning");
        return;
    }

    // Validación: si se usa solo una fecha → error
    //if ((fechaDesde && !fechaHasta) || (!fechaDesde && fechaHasta)) {
      //  mostrarMensaje("Debe seleccionar ambas fechas para buscar por rango.", "warning");
       // return;
    //}

    // Agregar parámetros dinámicamente
    if (nombre) params.append("nombre", nombre);
    if (apellido) params.append("apellido", apellido);
    //if (fechaDesde) params.append("fechaDesde", fechaDesde);
    //if (fechaHasta) params.append("fechaHasta", fechaHasta);

    const url = `${API_BASE_URL}/reservas/buscar?${params.toString()}`;
    console.log("GET → " + url);

    resultsBody.innerHTML = `<tr><td colspan="7" class="text-center">Buscando...</td></tr>`;

    try {
        const response = await fetch(url, { method: "GET" });

        // Sin resultados
        if (response.status === 204) {
            reservasEncontradas = [];
            resultsBody.innerHTML =
                `<tr><td colspan="7" class="text-center text-muted">No se encontraron reservas.</td></tr>`;
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        reservasEncontradas = data;
        mostrarResultadosBusqueda(data);

    } catch (e) {
        console.error(e);
        showAlert("Error", "Error al buscar reservas: " + e.message, "error");
        resultsBody.innerHTML =
            `<tr><td colspan="7" class="text-center text-danger">Error al cargar resultados.</td></tr>`;
    }
}

    // -----------------------------
    //  MOSTRAR RESULTADOS EN TABLA
    // -----------------------------
    function mostrarResultadosBusqueda(data) {
        resultsBody.innerHTML = "";

        if (!data || data.length === 0) {
            resultsBody.innerHTML =
                `<tr><td colspan="7" class="text-center text-muted">No se encontraron reservas.</td></tr>`;
            return;
        }

        data.forEach(reserva => {
            resultsBody.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${reserva.cliente?.nombre || ""}</td>
                    <td>${reserva.cliente?.apellido || ""}</td>
                    <td>${reserva.habitacion?.numero || "N/A"}</td>
                    <td>${reserva.fechaInicio}</td>
                    <td>${reserva.fechaFin}</td>
                    <td><span class="badge bg-${getEstadoBadgeColor(reserva.estado)}">${reserva.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-editar me-1" data-id="${reserva.reservaId}">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${reserva.reservaId}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    function getEstadoBadgeColor(estado) {
        switch (estado?.toLowerCase()) {
            case "confirmada": return "success";
            case "pendiente": return "warning text-dark";
            case "cancelada": return "secondary";
            default: return "light text-dark";
        }
    }

    // -----------------------------
    //  CARGAR HABITACIONES
    // -----------------------------
    async function cargarTodasLasHabitaciones() {
        try {
            const r = await fetch(`${API_BASE_URL}/habitaciones/listar`);
            if (!r.ok) throw new Error("Error al obtener habitaciones");
            todasLasHabitaciones = await r.json();
        } catch (e) {
            showAlert("Error", "No se pudieron cargar todas las habitaciones.", "error");
        }
    }

    function popularSelectHabitacionesEditar(habitacionActualId) {
        editHabitacionSelect.innerHTML = '<option value="">Seleccione una habitación...</option>';

        const actual = todasLasHabitaciones.find(h => h.habitacionId == habitacionActualId);
        if (actual) {
            const opt = document.createElement("option");
            opt.value = actual.habitacionId;
            const tipo = actual.tipo ? ` - ${actual.tipo.nombre}` : "";
            opt.textContent = `Habitación ${actual.numero}${tipo} (Actual)`;
            editHabitacionSelect.appendChild(opt);
        }

        todasLasHabitaciones.forEach(h => {
            if (h.habitacionId != habitacionActualId) {
                const opt = document.createElement("option");
                const tipo = h.tipo ? ` - ${h.tipo.nombre}` : "";
                opt.value = h.habitacionId;
                opt.textContent = `Habitación ${h.numero}${tipo}`;
                editHabitacionSelect.appendChild(opt);
            }
        });

        editHabitacionSelect.value = habitacionActualId || "";
    }

    // -----------------------------
    //  CARGAR ESTADOS RESERVA
    // -----------------------------
    async function cargarEstadosReservaEditar() {
        try {
            const r = await fetch(`${API_BASE_URL}/enums/estadosReserva`);
            if (!r.ok) throw new Error();

            const estados = await r.json();
            editEstadoSelect.innerHTML = '<option value="">Seleccione estado...</option>';

            estados.forEach(estado => {
                const opt = document.createElement("option");
                opt.value = estado.toLowerCase();
                opt.textContent = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
                editEstadoSelect.appendChild(opt);
            });

        } catch (e) {
            editEstadoSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    // -----------------------------
    //  ABRIR MODAL EDITAR
    // -----------------------------
    function abrirModalEditar(id) {
        const reserva = reservasEncontradas.find(r => r.reservaId == id);
        if (!reserva || !modalEditar) return;

        reservaIdInput.value = reserva.reservaId;
        editNombreInput.value = reserva.cliente?.nombre || "";
        editApellidoInput.value = reserva.cliente?.apellido || "";
        editEmailInput.value = reserva.cliente?.email || "";
        editTelefonoInput.value = reserva.cliente?.telefono || "";
        editCantidadPersonasInput.value = reserva.cantidadPersonas;
        editFechaInicioInput.value = reserva.fechaInicio;
        editFechaFinInput.value = reserva.fechaFin;

        // Habitación
        popularSelectHabitacionesEditar(reserva.habitacion?.habitacionId);

        // Estado
        if (editEstadoSelect.options.length <= 1) {
            cargarEstadosReservaEditar().then(() => {
                editEstadoSelect.value = reserva.estado.toLowerCase();
            });
        } else {
            editEstadoSelect.value = reserva.estado.toLowerCase();
        }

        modalEditar.show();
    }

    // -----------------------------
    //  GUARDAR EDICIÓN
    // -----------------------------
    async function guardarEdicionReserva(e) {
        e.preventDefault();
        limpiarMensajes();

        const idReserva = reservaIdInput.value;
        if (!idReserva) return;

        if (editFechaFinInput.value <= editFechaInicioInput.value) {
            mostrarMensaje("La fecha de salida debe ser posterior a la de entrada.", "warning");
            return;
        }

        const datos = {
            fechaInicio: editFechaInicioInput.value,
            fechaFin: editFechaFinInput.value,
            cantidadPersonas: parseInt(editCantidadPersonasInput.value),
            estado: editEstadoSelect.value,
            habitacionId: parseInt(editHabitacionSelect.value),
            cliente: {
                nombre: editNombreInput.value,
                apellido: editApellidoInput.value,
                email: editEmailInput.value,
                telefono: editTelefonoInput.value,
            }
        };

        try {
            const r = await fetch(`${API_BASE_URL}/reservas/${idReserva}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!r.ok) {
                const txt = await r.text();
                throw new Error(txt);
            }

            mostrarMensaje("Reserva actualizada correctamente.", "success");
            modalEditar.hide();
            buscarReservas();

        } catch (e) {
            showAlert("Error", "No se pudo guardar la edición: " + e.message, "error");
        }
    }

    // -----------------------------
    //  ELIMINAR RESERVA
    // -----------------------------
    async function eliminarReserva(id) {
        if (!id) return;

        if (typeof Swal !== "undefined") {
            Swal.fire({
                title: "¿Eliminar reserva?",
                text: `La reserva ${id} será eliminada permanentemente.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar"
            }).then(res => {
                if (res.isConfirmed) procederConEliminacion(id);
            });
        }
    }

    async function procederConEliminacion(id) {
        try {
            const r = await fetch(`${API_BASE_URL}/reservas/${id}`, {
                method: "DELETE"
            });

            if (!r.ok && r.status !== 204) {
                throw new Error("No se pudo eliminar");
            }

            showAlert("Eliminada", `Reserva ${id} eliminada con éxito.`, "success");
            buscarReservas();

        } catch (e) {
            showAlert("Error", "No se pudo eliminar la reserva: " + e.message, "error");
        }
    }

    // -----------------------------
    //  LIMPIAR FILTROS
    // -----------------------------
    function limpiarFiltros() {
        searchNombreInput.value = "";
        searchApellidoInput.value = "";
        searchFechaDesdeInput.value = "";
        searchFechaHastaInput.value = "";
        limpiarMensajes();

        resultsBody.innerHTML =
            `<tr><td colspan="7" class="text-center text-muted">Realice una búsqueda para ver resultados.</td></tr>`;
        reservasEncontradas = [];
    }

    // -----------------------------
    //  EVENTOS
    // -----------------------------
    if (btnBuscar) btnBuscar.addEventListener("click", buscarReservas);
    if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltros);

    if (resultsBody) {
        resultsBody.addEventListener("click", e => {
            const idEditar = e.target.closest(".btn-editar")?.dataset.id;
            const idEliminar = e.target.closest(".btn-eliminar")?.dataset.id;

            if (idEditar) abrirModalEditar(idEditar);
            if (idEliminar) eliminarReserva(idEliminar);
        });
    }

    if (formEditar) formEditar.addEventListener("submit", guardarEdicionReserva);

    // Inicialización
    cargarTodasLasHabitaciones();
    cargarEstadosReservaEditar();

});
