    // Clase para gestionar el calendario (SIN CAMBIOS)
    class CalendarManager {
        constructor() {
            this.currentDate = new Date();
            this.selectedDate = null;
            this.view = 'month';
            
            const today = new Date().getDate();
            this.currentDate.setDate(1); 
            const daysInMonth = this.getDaysInMonth();
            this.currentDate.setDate(Math.min(today, daysInMonth)); 
        }

        getCurrentMonth() {
            return this.currentDate.getMonth();
        }

        getCurrentYear() {
            return this.currentDate.getFullYear();
        }

        getMonthName() {
            const months = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            return `${months[this.getCurrentMonth()]} ${this.getCurrentYear()}`;
        }

        nextMonth() {
            const currentDay = this.currentDate.getDate();
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            if (this.currentDate.getDate() !== currentDay) {
                this.currentDate.setDate(0); 
            }
        }

        prevMonth() {
            const currentDay = this.currentDate.getDate();
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            if (this.currentDate.getDate() !== currentDay) {
                this.currentDate.setDate(0); 
            }
        }

        getDaysInMonth() {
            const year = this.getCurrentYear();
            const month = this.getCurrentMonth();
            return new Date(year, month + 1, 0).getDate();
        }

        getFirstDayOfMonth() {
            const year = this.getCurrentYear();
            const month = this.getCurrentMonth();
            return new Date(year, month, 1).getDay();
        }

        isToday(day) {
        const today = new Date();
        // comparar en UTC para evitar errores por zona horaria
        return day === today.getUTCDate() &&
            this.getCurrentMonth() === today.getUTCMonth() &&
            this.getCurrentYear() === today.getUTCFullYear();
}

        formatDate(date) {
            if (!date) return null;
                // usar getters UTC porque parseDate crea fechas en UTC
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
        }

        
        parseDate(dateString) {
            if (!dateString) return null; // Evitar errores con fechas inválidas
            const parts = dateString.split('-');
            // Crear la fecha en UTC para evitar problemas de zona horaria al parsear YYYY-MM-DD
            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
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


    // ======================================================
    // CLASE RESERVATION MANAGER (CONECTADA A SPRING BOOT)
    // ======================================================
    class ReservationManager {
        
        constructor(baseUrl) {
            this.API_BASE_URL = baseUrl;
            this.currentReservationId = null; 
        }

        async getReservationsForMonth(year, month) {
        try {
            const monthForAPI = month + 1;
            const response = await fetch(`${this.API_BASE_URL}/reservas/por-mes?anio=${year}&mes=${monthForAPI}`);
            
            if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error al cargar reservas (${response.status}): ${errorText}`);
                }
                // Si la respuesta está vacía (ej. 204 No Content), devolver array vacío
                if (response.status === 204) {
                    return [];
                }
               const rawReservations = await response.json();

            // 💡 SOLUCIÓN FINAL: Mapear y forzar reservaId a ser un número entero.
            return rawReservations.map(res => ({
                ...res,
                reservaId: parseInt(res.reservaId) // Esto resuelve la inconsistencia de tipos.
            }));
            
        } catch (error) {
            console.error(error);
            showAlert("Error",`Error de red o servidor: ${error.message}`, "error")
            return []; 
        }
    }
    

        async addReservation(registroDTO) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/reservas/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registroDTO)
                });

                if (!response.ok) {
                    // Intentar leer el cuerpo del error como JSON, si falla, usar texto plano
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { message: await response.text() };
                    }
                    throw new Error(errorData.message || `Error ${response.status} al crear la reserva`);
                }
                return await response.json();
            } catch (error) {
                console.error(error);
                showAlert("Error", `No se puede reservar una habitación que se encuentra ocupada o en mantenimiento.`, "warning")
                return null;
            }
        }

        async updateReservation(id, updateDTO) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/reservas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateDTO)
                });
                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { message: await response.text() };
                    }
                    throw new Error(errorData.message || `Error ${response.status} al actualizar la reserva`);
                }
                return await response.json();
            } catch (error) {
                console.error(error);
                showAlert("Error",`Error al actualizar: ${error.message}`, "error")
                return null;
            }
        }

        async deleteReservation(id) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/reservas/${id}`, {
                    method: 'DELETE'
                });
                // 204 No Content es un éxito para DELETE
                if (!response.ok && response.status !== 204) {
                    let errorText = await response.text();
                    throw new Error(`Error ${response.status} al eliminar la reserva: ${errorText}`);
                }
                return true; // Éxito si es ok o 204
            } catch (error) {
                console.error(error);
                showAlert("Error",`Error al eliminar: ${error.message}`,"error")
                return false;
            }
        }

        // --- Funciones de ayuda (sin cambios) ---
        calculateDebt(total, deposit, paid) { // Renombrado paid a deposit para claridad
    return Math.max(0, (total || 0) - ((deposit || 0) + (paid || 0)));        }
        
        getPaymentStatusText(status) {
            if (!status) return 'Desconocido';
            const statusMap = {
                pendiente: 'Pendiente',
                confirmada: 'Confirmada',
                cancelada: 'Cancelada'
            };
            return statusMap[status.toLowerCase()] || 'Desconocido';
        }
    }
    // --- FIN DE LAS CLASES ---


    // ======================================================
    // LÓGICA DE LA APLICACIÓN (CONECTADA A SPRING BOOT)
    // ======================================================
    document.addEventListener('DOMContentLoaded', () => {
        
        const API_BASE_URL = "http://localhost:8080"; // URL de tu backend

        // Instancias
        const calendar = new CalendarManager();
        const reservations = new ReservationManager(API_BASE_URL);
        
        // Estado de la aplicación
        let appSelectedDate = null;
        let currentMonthReservations = []; // Caché de reservas del mes

        // --- Selectores del DOM ---
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthEl = document.getElementById('currentMonth');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const roomFilter = document.getElementById('roomFilter');
        const dayReservationsEl = document.getElementById('dayReservations');
        
        // Modales
        const reservationModal = document.getElementById('reservationModal');
        const detailsModal = document.getElementById('detailsModal');
        const newReservationBtn = document.getElementById('newReservationBtn');
        const closeButtons = document.querySelectorAll('.close-modal');

        // === Formulario de Reserva ===
        const modalTitle = document.getElementById('modalTitle');
        const reservationRoomSelect = document.getElementById('reservationRoom');
        // Cliente
        const guestNombreInput = document.getElementById('guestNombre');
        const guestApellidoInput = document.getElementById('guestApellido');
        const guestEmailInput = document.getElementById('guestEmail');
        const guestTelefonoInput = document.getElementById('guestTelefono');
        // Reserva
        const checkInDateInput = document.getElementById('checkInDate');
        const checkOutDateInput = document.getElementById('checkOutDate');
        const guestCountInput = document.getElementById('guestCount');
        const reservationNotesInput = document.getElementById('reservationNotes'); // Notas/Comentarios
        // Pago
        const totalAmountInput = document.getElementById('totalAmount'); // monto
        const depositAmountInput = document.getElementById('depositAmount'); // senia
        const metodoPagoSelect = document.getElementById('metodoPago');
        const paidAmountInput = document.getElementById('paymentMade');
        const summaryPaid = document.getElementById('summaryPaid');//pagado / pago

        // Estado (para editar)
        const paymentStatusContainer = document.getElementById('paymentStatusContainer');
        const paymentStatusSelect = document.getElementById('paymentStatus');
        // Botones
        const saveReservationBtn = document.getElementById('saveReservation');
        const cancelReservationBtn = document.getElementById('cancelReservation');
        const deleteReservationBtn = document.getElementById('deleteReservation');
        
        // Resumen de pago
        const summaryTotal = document.getElementById('summaryTotal');
        const summaryDeposit = document.getElementById('summaryDeposit');
        const summaryDebt = document.getElementById('summaryDebt');

        // Modal de Detalles
        const reservationDetailsEl = document.getElementById('reservationDetails');
        const editReservationBtn = document.getElementById('editReservationBtn');
        const closeDetailsBtn = document.getElementById('closeDetails');

        // --- Funciones Principales ---

        async function renderCalendar() {
            if (!calendarGrid || !currentMonthEl) return; // Salir si los elementos no existen
            calendarGrid.innerHTML = '<div>Cargando...</div>'; // Feedback visual
            currentMonthEl.textContent = calendar.getMonthName();
            
            const firstDay = calendar.getFirstDayOfMonth();
            const daysInMonth = calendar.getDaysInMonth();
            const currentFilter = roomFilter.value;
            
            currentMonthReservations = await reservations.getReservationsForMonth(
                calendar.getCurrentYear(), 
                calendar.getCurrentMonth()
            );
            
            calendarGrid.innerHTML = ''; // Limpiar el 'Cargando...'

            // Celdas vacías
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('calendar-day', 'empty');
                calendarGrid.appendChild(emptyCell);
            }

            // Celdas de días
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('calendar-day');
                
                const date = new Date(Date.UTC(calendar.getCurrentYear(), calendar.getCurrentMonth(), day)); // Usar UTC
                const dateString = calendar.formatDate(date);
                dayCell.dataset.date = dateString;

                if (calendar.isToday(day)) dayCell.classList.add('today');
                if (dateString === appSelectedDate) dayCell.classList.add('selected');

                const dayNumber = document.createElement('span');
                dayNumber.classList.add('date-number');
                dayNumber.textContent = day;
                dayCell.appendChild(dayNumber);

                const reservationsContainer = document.createElement('div');
                reservationsContainer.classList.add('reservations-container');
                
                // Encontrar y renderizar reservas
               
                const dayReservations = currentMonthReservations.filter(res => {
                    const checkIn = calendar.parseDate(res.fechaInicio);
                    const checkOut = calendar.parseDate(res.fechaFin);

                    const checkInStr = calendar.formatDate(checkIn);
                    const checkOutStr = calendar.formatDate(checkOut);
                    // la reserva ocupa días desde checkIn (inclusive) hasta checkOut (exclusive)
                    return dateString >= checkInStr && dateString < checkOutStr;
                });
                
                dayReservations.forEach(res => {
                    if (!res.habitacion) {
                        showAlert("Advertencia","Reserva sin habitación asociada", "warning")
                        console.warn("Reserva sin habitación asociada:", res);
                        return; // Saltar esta reserva si no tiene habitación
                    }
                    if (currentFilter === 'all' || (res.habitacion && res.habitacion.habitacionId == currentFilter)) {
                        const resBar = document.createElement('div');
                        resBar.classList.add('reservation-bar');
                        resBar.textContent = `${res.cliente?.nombre || 'Cliente'} ${res.cliente?.apellido || ''}`.trim(); 
                        resBar.style.backgroundColor = getRoomColor(res.habitacion.habitacionId);
                        resBar.dataset.reservationId = res.reservaId; 
                        
                        // Añadir listener para abrir detalles al hacer clic en la barra
                        resBar.addEventListener('click', (event) => {
                        event.stopPropagation(); // Evitar que se seleccione el día al hacer clic en la barra
                        openDetailsModal(res.reservaId);
                        });
                        
                        reservationsContainer.appendChild(resBar);
                    }
                });

                dayCell.appendChild(reservationsContainer);
                // Listener para seleccionar el día
                dayCell.addEventListener('click', () => selectDay(dayCell, dateString));
                calendarGrid.appendChild(dayCell);
            }
            
            if(appSelectedDate) {
                renderDayReservations(appSelectedDate);
            }
        }

        function selectDay(cell, dateString) {
            const oldSelected = document.querySelector('.calendar-day.selected');
            if (oldSelected) { oldSelected.classList.remove('selected');
            }
            cell.classList.add('selected');
            appSelectedDate = dateString;
            
            if (dayReservationsEl){
                dayReservationsEl.innerHTML='<p class="no-reservations">Cargando...</p>';
                // si dejamos el return; no muestran las reservas al seleccionar el día
            }

            renderDayReservations(dateString);

        }

      function renderDayReservations(dateString) {
    if (!dayReservationsEl) return;

    if (!dateString) {
        dayReservationsEl.innerHTML = '<p class="no-reservations">Selecciona un día para ver las reservas</p>';
        return;
    }

    // Limpiar siempre antes
    dayReservationsEl.innerHTML = '';

    // Usar comparación por strings (YYYY-MM-DD) para evitar problemas de horas/zona
    const targetDateStr = dateString;

    const dayRes = currentMonthReservations.filter(res => {
        const checkIn = calendar.parseDate(res.fechaInicio);
        const checkOut = calendar.parseDate(res.fechaFin);
        const checkInStr = calendar.formatDate(checkIn);
        const checkOutStr = calendar.formatDate(checkOut);
        return targetDateStr >= checkInStr && targetDateStr < checkOutStr;
    });

    const currentFilter = roomFilter.value;
    const filteredRes = dayRes.filter(res => 
        currentFilter === 'all' || (res.habitacion && String(res.habitacion.habitacionId) === String(currentFilter))
    );

    // Si no hay reservas, mostrar el mensaje y salir
    if (filteredRes.length === 0) {
        dayReservationsEl.innerHTML = '<p class="no-reservations">No hay reservas para este día.</p>';
        return;
    }

    // Si hay reservas, renderizarlas
    filteredRes.forEach(res => {
        const card = document.createElement('div');
        card.classList.add('reservation-card');

        const reservaIdNumerico = parseInt(res.reservaId); 
        if(res.estado) card.classList.add(`status-${res.estado.toLowerCase()}`); 
        card.dataset.reservationId = reservaIdNumerico; 

        card.innerHTML = `
            <h4>${res.cliente?.nombre || 'Cliente'} ${res.cliente?.apellido || ''}</h4>
            <p><strong>Habitación:</strong> ${res.habitacion?.numero || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="status ${res.estado?.toLowerCase() || ''}">${reservations.getPaymentStatusText(res.estado)}</span></p>
        `;

        card.addEventListener('click', () => openDetailsModal(reservaIdNumerico));
        dayReservationsEl.appendChild(card);
    });
}

        async function populateFilters() {
            if (!roomFilter || !reservationRoomSelect) return;
            roomFilter.innerHTML = '<option value="all">Todas las habitaciones</option>';
            reservationRoomSelect.innerHTML = '<option value="">Seleccionar...</option>';
            
            try {
                const response = await fetch(`${API_BASE_URL}/habitaciones/listar`);
                if (!response.ok) throw new Error('Error al cargar habitaciones');
                
                const rooms = await response.json();
                
                rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.habitacionId; 
                    option.textContent = room.numero; 
                    roomFilter.appendChild(option);
                    reservationRoomSelect.appendChild(option.cloneNode(true));
                });

            } catch (error) {
                console.error(error);
                showAlert("Error","Error: No se pudieron cargar las habitaciones." ,"error")
            }
        }

        // --- Lógica de Modales ---

        function openModal(modal) {
            if(modal) modal.style.display = 'block';
        }

        function closeModal(modal) {
            if(modal) modal.style.display = 'none';
        }

        function resetReservationForm() {
            if (!reservationModal) return;
            modalTitle.textContent = 'Nueva Reserva';
            reservations.currentReservationId = null;
            
            reservationModal.querySelector(".modal-body").querySelectorAll("input, select, textarea").forEach(el => {
                if(el.tagName === 'SELECT') el.selectedIndex = 0;
                else if (el.type !== 'number') el.value = ''; // No limpiar números para mantener el '1'
            });
            
            guestCountInput.value = '1'; // Restaurar personas a 1
            totalAmountInput.value = ''; // Limpiar montos explícitamente
            depositAmountInput.value = '';

            if(deleteReservationBtn) deleteReservationBtn.style.display = 'none';
            if(paymentStatusContainer) paymentStatusContainer.style.display = 'none'; 
            
            updatePaymentSummary();
        }

        function openNewReservationModal() {
            resetReservationForm();
            if (appSelectedDate) {
                checkInDateInput.value = appSelectedDate;
            }
            openModal(reservationModal);
        }
        
       function openEditReservationModal(reservationId) {
    resetReservationForm();
    
    const res = currentMonthReservations.find(r => r.reservaId === reservationId);
    if (!res) {
        showAlert("Advertencia", "No se encontró la reserva para editar.", "warning");
        return;
    }

    modalTitle.textContent = 'Editar Reserva';
    reservations.currentReservationId = res.reservaId;

    // Cliente
    if(res.cliente) {
        guestNombreInput.value = res.cliente.nombre || '';
        guestApellidoInput.value = res.cliente.apellido || '';
        guestEmailInput.value = res.cliente.email || '';
        guestTelefonoInput.value = res.cliente.telefono || '';
    }

    // Habitación
    reservationRoomSelect.value = res.habitacion.habitacionId;

    // Fechas y personas
    checkInDateInput.value = res.fechaInicio;
    checkOutDateInput.value = res.fechaFin;
    guestCountInput.value = res.cantidadPersonas;

    reservationNotesInput.value = res.notas || '';

    // Pago
    if(res.pago) {
        totalAmountInput.value = Number(res.pago.monto || 0);
        depositAmountInput.value = Number(res.pago.senia || 0);
        paidAmountInput.value = Number(res.pago.pagoRealizado || 0);
        metodoPagoSelect.value = res.pago.metodoPago || 'efectivo';

        // FIX: evitar errores si viene string o vacío
        summaryPaid.textContent = Number(res.pago.pagoRealizado || 0).toFixed(2);
    }

    paymentStatusSelect.value = res.estado?.toLowerCase() || 'pendiente';

    deleteReservationBtn.style.display = 'inline-block';
    paymentStatusContainer.style.display = 'block';

    updatePaymentSummary();
    openModal(reservationModal);
}


function openDetailsModal(reservationId) {
    if (!detailsModal || !reservationDetailsEl) return;

    const idToFind = parseInt(reservationId);
    const res = currentMonthReservations.find(r => r.reservaId === idToFind);

    if (!res) {
        showAlert("Advertencia", "No se encontraron detalles para esta reserva.", "warning");
        return;
    }

    // Convertir todo a número (evita errores)
    const monto = Number(res.pago?.monto || 0);
    const senia = Number(res.pago?.senia || 0);
    const pagado = Number(res.pago?.pagoRealizado || 0);

    // Calcular deuda real
    const debt = Math.max(0, monto - (senia + pagado));

    reservationDetailsEl.innerHTML = `
        <p><strong>Huésped:</strong> ${res.cliente?.nombre || ''} ${res.cliente?.apellido || ''}</p>
        <p><strong>Email:</strong> ${res.cliente?.email || 'N/A'}</p>
        <p><strong>Teléfono:</strong> ${res.cliente?.telefono || 'N/A'}</p>
        <p><strong>Habitación:</strong> ${res.habitacion?.numero || 'N/A'}</p>

        <p><strong>Check-in:</strong> ${res.fechaInicio}</p>
        <p><strong>Check-out:</strong> ${res.fechaFin}</p>
        <p><strong>Personas:</strong> ${res.cantidadPersonas}</p>
        <p><strong>Notas:</strong> ${res.notas || 'Sin notas'}</p>

        <p><strong>Monto Total:</strong> $${monto.toFixed(2)}</p>
        <p><strong>Pagado:</strong> $${pagado.toFixed(2)}</p>
        <p><strong>Seña:</strong> $${senia.toFixed(2)}</p>
        <p><strong>Debe:</strong> $${debt.toFixed(2)}</p>

        <p><strong>Método Pago:</strong> ${res.pago?.metodoPago || 'N/A'}</p>
        <p><strong>Estado Reserva:</strong> 
            <span class="status ${res.estado?.toLowerCase()}">
                ${reservations.getPaymentStatusText(res.estado)}
            </span>
        </p>
    `;

    editReservationBtn.dataset.reservationId = res.reservaId;
    openModal(detailsModal);
}

        
       async function handleSaveReservation() {

    if (!guestNombreInput.value || !guestApellidoInput.value || !guestEmailInput.value ||
        !checkInDateInput.value || !checkOutDateInput.value || !reservationRoomSelect.value) {

        showAlert("Campos incompletos", 'Por favor, completa todos los campos obligatorios.', "warning");
        return;
    }

    if (checkOutDateInput.value <= checkInDateInput.value) {
        showAlert("Advertencia", 'La fecha de salida debe ser posterior a la fecha de entrada.', "warning");
        return;
    }

    // Si EDITA reserva existente
    if (reservations.currentReservationId) {

        const total = Number(totalAmountInput.value || 0);
        const senia = Number(depositAmountInput.value || 0);
        const pagado = Number(paidAmountInput.value || 0);
        const debe = Math.max(0, total - (senia + pagado));

        const updateDTO = {
            fechaInicio: checkInDateInput.value,
            fechaFin: checkOutDateInput.value,
            cantidadPersonas: Number(guestCountInput.value),
            estado: paymentStatusSelect.value,
            habitacionId: Number(reservationRoomSelect.value),
            cliente: {
                nombre: guestNombreInput.value,
                apellido: guestApellidoInput.value,
                email: guestEmailInput.value,
                telefono: guestTelefonoInput.value
            },
            pago: {
                monto: total,
                senia: senia,
                pagoRealizado: pagado,
                debe: debe,
                metodoPago: metodoPagoSelect.value
            },
            notas: reservationNotesInput.value
        };

        const updatedReservation = await reservations.updateReservation(reservations.currentReservationId, updateDTO);
        if (!updatedReservation) return;

        showAlert("Éxito", "Reserva actualizada correctamente", "success");

    } else {
        // CREAR reserva nueva
        const registroDTO = {
            fechaInicio: checkInDateInput.value,
            fechaFin: checkOutDateInput.value,
            cantidadPersonas: Number(guestCountInput.value),
            cliente: {
                nombre: guestNombreInput.value,
                apellido: guestApellidoInput.value,
                email: guestEmailInput.value,
                telefono: guestTelefonoInput.value
            },
            habitacion: {
                habitacionId: Number(reservationRoomSelect.value)
            },
            pago: {
                monto: Number(totalAmountInput.value),
                senia: Number(depositAmountInput.value),
                metodoPago: metodoPagoSelect.value
            },
            notas: reservationNotesInput.value
        };

        const newReservation = await reservations.addReservation(registroDTO);
        if (!newReservation) return;

        showAlert("Éxito", "Reserva creada correctamente", "success");
    }

    closeModal(reservationModal);

    // 🔥 RECARGAR RESERVAS DEL MES (FIX DEFINITIVO)
    currentMonthReservations = await reservations.getReservationsForMonth(
        calendar.getCurrentYear(),
        calendar.getCurrentMonth()
    );

    await renderCalendar();
}
        
        async function handleDeleteReservation() {
    const id = reservations.currentReservationId;
    if (!id) return;

    // Mostrar alerta de confirmación con SweetAlert2
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la reserva permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    // Si el usuario confirma la eliminación
    if (result.isConfirmed) {
        const success = await reservations.deleteReservation(id);

        if (success) {
            // Mostrar mensaje de éxito
            await Swal.fire({
                title: "¡Eliminada!",
                text: "La reserva fue eliminada con éxito.",
                icon: "success",
                confirmButtonColor: "#3085d6"
            });

            closeModal(reservationModal);
            await renderCalendar();
        } else {
            // Mostrar mensaje de error
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar la reserva.",
                icon: "error"
            });
        }
    }
}

        function updatePaymentSummary() {
    const total = Number(totalAmountInput.value || 0);
    const deposit = Number(depositAmountInput.value || 0);
    const paid = Number(paidAmountInput.value || 0);

    const debt = Math.max(0, total - (deposit + paid));

    summaryTotal.textContent = total.toFixed(2);
    summaryDeposit.textContent = deposit.toFixed(2);
    summaryPaid.textContent = paid.toFixed(2);
    summaryDebt.textContent = debt.toFixed(2);
}



        function getRoomColor(roomId) {
            if (!roomId) return '#888'; // Color por defecto si no hay ID
            const colors = ['#e57373', '#81c784', '#64b5f6', '#ffb74d', '#ba68c8', '#a1887f', '#90a4ae'];
            // Usar el ID numérico para obtener un índice consistente
            return colors[Number(roomId) % colors.length];
        }
        

        // --- Event Listeners ---
        
        if(prevMonthBtn) prevMonthBtn.addEventListener('click', async () => {
            calendar.prevMonth();
            await renderCalendar();
        });
        if(nextMonthBtn) nextMonthBtn.addEventListener('click', async () => {
            calendar.nextMonth();
            await renderCalendar();
        });

        if(roomFilter) roomFilter.addEventListener('change', async () => {
            // Al cambiar filtro, re-renderizar SIN llamar a la API de nuevo
            await renderCalendar(); // Llamar a render para aplicar el filtro visualmente
        });
        
        if(newReservationBtn) newReservationBtn.addEventListener('click', openNewReservationModal);
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(reservationModal);
                closeModal(detailsModal);
            });
        });
        
        if(cancelReservationBtn) cancelReservationBtn.addEventListener('click', () => closeModal(reservationModal));
        if(closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => closeModal(detailsModal));
        
        if(saveReservationBtn) saveReservationBtn.addEventListener('click', handleSaveReservation);
        if(deleteReservationBtn) deleteReservationBtn.addEventListener('click', handleDeleteReservation);
        
        if(editReservationBtn) editReservationBtn.addEventListener('click', (e) => {
        // Usar parseInt al leer del dataset
        const id = parseInt(e.target.dataset.reservationId); 
        if (id) {
            closeModal(detailsModal);
            openEditReservationModal(id);
        }
    });
        
        // Listeners para actualizar resumen de pago
        if(totalAmountInput) totalAmountInput.addEventListener('input', updatePaymentSummary);
        if(depositAmountInput) depositAmountInput.addEventListener('input', updatePaymentSummary);
        if(paidAmountInput) paidAmountInput.addEventListener('input', updatePaymentSummary);

        // --- Inicialización ---
        async function init() {
            try {
                await populateFilters(); 
                await renderCalendar();  
                renderDayReservations(appSelectedDate); 
            } catch (error) {
                console.error("Error durante la inicialización:", error);
                // Mostrar un mensaje de error más general al usuario si falla la inicialización
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.innerHTML = `<p style="color: red; text-align: center; padding: 2rem;">Error al cargar la aplicación. Por favor, intente recargar la página o contacte al soporte.</p>`;
                }
            }
        }

        init();
    });