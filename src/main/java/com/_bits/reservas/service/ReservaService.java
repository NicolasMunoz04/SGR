package com._bits.reservas.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com._bits.reservas.DTO.ActualizarEstadoDTO;
import com._bits.reservas.DTO.ActualizarReservaDTO;
import com._bits.reservas.DTO.CheckInOutDTO;
import com._bits.reservas.DTO.RegistroReservaDTO;
import com._bits.reservas.DTO.ReservaDTO;
import com._bits.reservas.entity.Cliente;
import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.entity.Habitacion.EstadoHabitacion;
import com._bits.reservas.entity.Pago;
import com._bits.reservas.entity.Reserva;
import com._bits.reservas.entity.Reserva.EstadoReserva;
import com._bits.reservas.mapper.ReservaMapper;
import com._bits.reservas.repository.ClienteRepository;
import com._bits.reservas.repository.HabitacionRepository;
import com._bits.reservas.repository.PagoRepository;
import com._bits.reservas.repository.ReservaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservaService {

    // Beans
    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final HabitacionRepository habitacionRepository;
    private final PagoRepository pagoRepository;
    private final ReservaMapper reservaMapper;

    // Listar todas las reservas
    List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    // Listas las reservas por el Id del ciente POR LAS DUDAS
    List<Reserva> listarPorClienteId(Long cliente_id) {
        return reservaRepository.findByClienteClienteId(cliente_id);
    }

    // Listas las reservas por el nombre del cliente
    public List<Reserva> listarPorClienteNombreApellido(String nombre, String apellido) {
        List<Cliente> clientes = clienteRepository.findByNombreAndApellido(nombre, apellido);

        if (clientes.isEmpty()) {
            throw new IllegalArgumentException("No se encontraron clientes con nombre: " + nombre + " y apellido: " + apellido);
        }

        // Traer todas las reservas de todos los clientes encontrados
        return clientes.stream()
                .flatMap(c -> reservaRepository.findByClienteClienteId(c.getClienteId()).stream())
                .toList();
    }

    /**
     * Crear una nueva reserva. [CORREGIDO] Se calcula el 'debe' inicial usando
     * la lógica correcta: Monto - Seña - PagoRealizado (que es 0 al crear).
     */
    @Transactional
    public ReservaDTO crearReserva(RegistroReservaDTO dto) {
        // 1. Obtener Cliente (Lógica existente)
        Cliente cliente = clienteRepository.findByEmail(dto.getCliente().getEmail())
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente();
                    nuevo.setNombre(dto.getCliente().getNombre());
                    nuevo.setApellido(dto.getCliente().getApellido());
                    nuevo.setEmail(dto.getCliente().getEmail());
                    nuevo.setTelefono(dto.getCliente().getTelefono());
                    return clienteRepository.save(nuevo);

                });

        // 2. Obtener Habitación (Lógica existente)
        Long habitacionId = dto.getHabitacion().getHabitacionId();
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + habitacionId));

        // 3. Validar Habitación (Lógica existente)
        if (habitacion.getEstado() != Habitacion.EstadoHabitacion.disponible) {
            throw new IllegalStateException("La habitación no está disponible. Estado actual: " + habitacion.getEstado());
        }

        // 4. Crear Reserva (EN MEMORIA, NO GUARDAR)
        Reserva reserva = reservaMapper.toEntity(dto, cliente, habitacion);
        // El campo 'reserva.pago' está nulo en este momento

        // --- [INICIO DE LA CORRECCIÓN 1] ---
        // 5. Crear Pago (EN MEMORIA, NO GUARDAR)
        // Aseguramos que los valores no sean nulos
        BigDecimal monto = (dto.getPago().getMonto() != null) ? dto.getPago().getMonto() : BigDecimal.ZERO;
        BigDecimal senia = (dto.getPago().getSenia() != null) ? dto.getPago().getSenia() : BigDecimal.ZERO;
        // 'pagoRealizado' son pagos ADICIONALES a la seña, por lo tanto, es 0 al inicio.
        BigDecimal pagoRealizadoInicial = BigDecimal.ZERO;

        // [CAMBIO CLAVE] El 'debe' inicial es Monto - Seña - Pagos Adicionales (que es 0)
        BigDecimal debeInicial = monto.subtract(senia).subtract(pagoRealizadoInicial);

        Pago pago = new Pago();
        pago.setMonto(monto);
        pago.setSenia(senia);
        pago.setDebe(debeInicial.max(BigDecimal.ZERO)); // Guardamos el 'debe' calculado
        pago.setMetodoPago(dto.getPago().getMetodoPago());
        pago.setFechaPago(LocalDateTime.now());
        pago.setPagoRealizado(pagoRealizadoInicial); // Guardamos 0
        // --- [FIN DE LA CORRECCIÓN 1] ---

        // 6. ¡¡VINCULAR AMBOS LADOS DE LA RELACIÓN!! (Crucial)
        // Esto establece la relación en memoria para que JPA la entienda.
        reserva.setPago(pago);
        pago.setReserva(reserva);

        // 7. Marcar la habitación como ocupada
        // (Lo guardamos ahora para que esté listo)
        habitacion.setEstado(EstadoHabitacion.ocupada);
        habitacionRepository.save(habitacion);

        // 8. GUARDAR UNA SOLA VEZ
        // Gracias a 'CascadeType.ALL' en 'Reserva.pago',
        // esto guardará la 'Reserva' Y el 'Pago' automáticamente
        // en el orden correcto.
        Reserva reservaGuardada = reservaRepository.save(reserva);

        // Devolver DTO
        return reservaMapper.toDTO(reservaGuardada);
    }

    // Método para confirmar una reserva YA EXISTENTE
    @Transactional
    public ReservaDTO confirmarReserva(Long reservaId) {
        // Busco la reserva
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + reservaId));

        // Si el estado de la reserva ya esta confirmada o fue cancelada capturo el
        // error
        if (reserva.getEstado() != EstadoReserva.pendiente) {
            throw new IllegalStateException("No se puede confirmar la reserva, su estado debe ser pendiente!");
        }

        // Busco el pago asociado a la reserva
        Pago pago = reserva.getPago();
        if (pago == null) {
            throw new IllegalStateException("No hay pagos asociados a la reserva.");
        }

        // Actualizo datos del pago
        // Asignamos el monto total al pago realizado al confirmar
        pago.setPagoRealizado(pago.getMonto().subtract(pago.getSenia()));
        pago.setDebe(BigDecimal.ZERO); // Ya no debe dinero
        pago.setFechaPago(LocalDateTime.now()); // Se actualiza la fecha del pago
        pagoRepository.save(pago); // Guardo

        reserva.setEstado(EstadoReserva.confirmada); // Actualizo el estado de la reserva

        // Ocupamos la habitación (aunque ya debería estarlo por 'crearReserva')
        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null && habitacion.getEstado() != EstadoHabitacion.ocupada) {
            habitacion.setEstado(EstadoHabitacion.ocupada);
            habitacionRepository.save(habitacion);
        }

        // Guardamos todo
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return reservaMapper.toDTO(reservaActualizada);
    }

    // Eliminar una reserva por su ID
    public void eliminarReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        // Verifico si la reserva fue cancelada
        if (reserva.getEstado() == EstadoReserva.cancelada) {
            throw new IllegalStateException("La reserva ya está cancelada.");
        }

        // Libero la habitacion ocupada
        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null && habitacion.getEstado() == EstadoHabitacion.ocupada) {
            habitacion.setEstado(EstadoHabitacion.disponible);
            habitacionRepository.save(habitacion);
        }

        // 'CascadeType.ALL' y 'orphanRemoval = true' (si lo tuvieras)
        // se encargarían del pago. Si no, eliminamos manualmente.
        // Dado que Reserva.pago tiene CascadeType.ALL, al borrar la reserva, el pago
        // también se borrará.
        reservaRepository.delete(reserva);
    }

    // Actualizar el estado de una reserva (pendiente, confirmada, cancelada)
    public Reserva actualizarEstadoReserva(ActualizarEstadoDTO dto) {
        // Buscar reserva
        Reserva reserva = reservaRepository.findById(dto.getReservaId())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Actualizar estado (conversión de String a Enum)
        try {
            EstadoReserva estado = EstadoReserva.valueOf(dto.getNuevoEstado().toLowerCase());
            reserva.setEstado(estado);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + dto.getNuevoEstado());
        }

        // Guardar en BD
        return reservaRepository.save(reserva);
    }

    // --- [INICIO DE LA CORRECCIÓN 2] ---
    // Transformacion de Check in y Check out a DTO
    // (Este método es llamado por obtenerCheckInHoy y obtenerCheckOutHoy)
    private CheckInOutDTO toDTO(Reserva reserva) {
        CheckInOutDTO dto = new CheckInOutDTO();
        dto.setReservaId(reserva.getReservaId());
        dto.setNombreCliente(reserva.getCliente().getNombre());
        dto.setApellidoCliente(reserva.getCliente().getApellido());
        dto.setNumeroHabitacion(reserva.getHabitacion().getNumero());
        dto.setFechaEntrada(reserva.getFechaInicio());
        dto.setFechaSalida(reserva.getFechaFin());

        // Es crucial verificar que el pago no sea nulo
        if (reserva.getPago() != null) {
            Pago pago = reserva.getPago(); // Obtenemos el objeto Pago

            // 1. Obtenemos todos los valores
            BigDecimal monto = (pago.getMonto() != null) ? pago.getMonto() : BigDecimal.ZERO;
            BigDecimal senia = (pago.getSenia() != null) ? pago.getSenia() : BigDecimal.ZERO;
            BigDecimal pagoRealizado = (pago.getPagoRealizado() != null) ? pago.getPagoRealizado() : BigDecimal.ZERO;

            // 2. [CAMBIO CLAVE] Recalculamos el 'debe' SIEMPRE, usando tu lógica:
            // debe = Monto Total - Seña - Pago Realizado
            BigDecimal debeCalculado = monto.subtract(senia).subtract(pagoRealizado);

            // 3. Enviamos todos los datos al DTO
            dto.setMontoTotal(monto);
            dto.setSenia(senia);
            dto.setPagoRealizado(pagoRealizado); // (Este campo faltaba en tu versión original)
            dto.setDebe(debeCalculado.max(BigDecimal.ZERO)); // Enviamos el 'debe' recalculado

        } else {
            // Valores por defecto si no hay pago (no debería pasar)
            dto.setMontoTotal(BigDecimal.ZERO);
            dto.setSenia(BigDecimal.ZERO);
            dto.setPagoRealizado(BigDecimal.ZERO); // (Este campo faltaba en tu versión original)
            dto.setDebe(BigDecimal.ZERO);
        }
        return dto;
    }
    // --- [FIN DE LA CORRECCIÓN 2] ---

    // Check in y Check out de hoy, estos metodos son para mostrarlos
    public List<CheckInOutDTO> obtenerCheckInHoy() {
        return reservaRepository.findByFechaInicio(LocalDate.now())
                .stream()
                .map(this::toDTO) // Ahora usa el DTO corregido
                .toList();
    }

    public List<CheckInOutDTO> obtenerCheckOutHoy() {
        return reservaRepository.findByFechaFin(LocalDate.now())
                .stream()
                .map(this::toDTO) // Ahora usa el DTO corregido
                .toList();
    }

    // Metodo para actualizar los datos de una reserva existente
    // se pueden modificar todos los datos de la reserva juntos o solamente algunos
    @Transactional
    public ReservaDTO actualizarReserva(ActualizarReservaDTO dto) {

        Reserva reserva = reservaRepository.findById(dto.getReservaId())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // ---------- ACTUALIZAR FECHAS ----------
        if (dto.getFechaInicio() != null) {
            reserva.setFechaInicio(dto.getFechaInicio());
        }
        if (dto.getFechaFin() != null) {
            reserva.setFechaFin(dto.getFechaFin());
        }

        // ---------- ACTUALIZAR ESTADO ----------
        if (dto.getEstado() != null) {
            try {
                Reserva.EstadoReserva estado = Reserva.EstadoReserva.valueOf(dto.getEstado().toLowerCase());
                reserva.setEstado(estado);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Estado inválido: " + dto.getEstado());
            }
        }

        // ---------- ACTUALIZAR HABITACIÓN ----------
        if (dto.getHabitacionId() != null) {
            Habitacion h = habitacionRepository.findById(dto.getHabitacionId())
                    .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada"));
            reserva.setHabitacion(h);
        }

        // ---------- ACTUALIZAR CLIENTE ----------
        if (dto.getCliente() != null) {
            Cliente cliente = reserva.getCliente();
            if (dto.getCliente().getNombre() != null) {
                cliente.setNombre(dto.getCliente().getNombre());
            }
            if (dto.getCliente().getApellido() != null) {
                cliente.setApellido(dto.getCliente().getApellido());
            }
            if (dto.getCliente().getEmail() != null) {
                cliente.setEmail(dto.getCliente().getEmail());
            }
            if (dto.getCliente().getTelefono() != null) {
                cliente.setTelefono(dto.getCliente().getTelefono());
            }
            clienteRepository.save(cliente);
        }

        // =====================================================
        //     🔥🔥🔥 ACTUALIZACIÓN DE PAGO — FALTABA 🔥🔥🔥
        // =====================================================
        if (dto.getPago() != null) {

            Pago pago = reserva.getPago();
            if (pago == null) {
                pago = new Pago();
                pago.setReserva(reserva);
            }

            // 🔥 Esto SIEMPRE tiene que actualizarse:
            pago.setMonto(dto.getPago().getMonto());
            pago.setSenia(dto.getPago().getSenia());
            pago.setPagoRealizado(dto.getPago().getPagoRealizado());
            pago.setDebe(dto.getPago().getDebe());
            pago.setMetodoPago(dto.getPago().getMetodoPago());

            // actualizar fecha de pago
            pago.setFechaPago(LocalDateTime.now());

            pagoRepository.save(pago);

            reserva.setPago(pago);
        }

        // ---------- GUARDAR RESERVA ----------
        Reserva guardada = reservaRepository.save(reserva);

        return reservaMapper.toDTO(guardada);
    }

    // Contar reservas pendientes
    public long contarPendientes() {
        return reservaRepository.countByEstado(EstadoReserva.pendiente);
    }

    // Contar reservas confirmadas
    public long contarConfirmadas() {
        return reservaRepository.countByEstado(EstadoReserva.confirmada);
    }

    /**
     * MODIFICACIÓN: Llama al repositorio y mapea los resultados a DTO para el
     * controlador.
     */
    public List<ReservaDTO> listarPorRangoDeFechas(LocalDate inicioMes, LocalDate finMes) {
        List<Reserva> reservas = reservaRepository.findReservasInDateRange(inicioMes, finMes);
        return reservas.stream()
                .map(reservaMapper::toDTO)
                .toList();
    }

    /**
     * NUEVO MÉTODO: Busca reservas por criterios combinados. Los parámetros
     * pueden ser null si no se usan para filtrar.
     */
    public List<ReservaDTO> buscarReservasPorCriterios(
            String nombre,
            String apellido,
            LocalDate fechaDesde,
            LocalDate fechaHasta) {

        // Normalizar vacíos a null
        String nombreFiltro = (nombre == null || nombre.trim().isEmpty())
                ? null
                : nombre.trim().toLowerCase();

        String apellidoFiltro = (apellido == null || apellido.trim().isEmpty())
                ? null
                : apellido.trim().toLowerCase();

        // Validar que exista al menos un criterio
        if (nombreFiltro == null && apellidoFiltro == null && fechaDesde == null && fechaHasta == null) {
            return List.of();
        }

        List<Reserva> reservas = reservaRepository.findReservasByCriteria(
                nombreFiltro,
                apellidoFiltro,
                fechaDesde,
                fechaHasta
        );

        return reservas.stream()
                .map(reservaMapper::toDTO)
                .toList();
    }

    // --- MÉTODO FINAL AÑADIDO ---
    /**
     * Busca la reserva activa (huésped) para una habitación específica. Es
     * llamado por el endpoint /reservas/habitacion/actual/{idHabitacion} que a
     * su vez es llamado por el modal "Ver Detalles" del frontend. Buscando la
     * reserva...
     */
    public ReservaDTO obtenerReservaActivaPorHabitacion(Long habitacionId) {
        LocalDate hoy = LocalDate.now();

        Optional<Reserva> reservaActivaOpt
                = reservaRepository.findReservaActivaPorHabitacion(habitacionId, hoy);

        return reservaActivaOpt.map(reservaMapper::toDTO).orElse(null);
    }

}
