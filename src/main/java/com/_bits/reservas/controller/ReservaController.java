package com._bits.reservas.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._bits.reservas.DTO.ActualizarEstadoDTO;
import com._bits.reservas.DTO.ActualizarReservaDTO;
import com._bits.reservas.DTO.CheckInOutDTO;
import com._bits.reservas.DTO.RegistroReservaDTO;
import com._bits.reservas.DTO.ReservaDTO;
import com._bits.reservas.entity.Reserva;
import com._bits.reservas.mapper.ReservaMapper;
import com._bits.reservas.repository.ReservaRepository; // <-- Asegúrate de importar este
import com._bits.reservas.service.ReservaService; // <-- Y este

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    // private final ClienteService clienteService;
    // private final HabitacionService habitacionService;
    private final ReservaMapper reservaMapper;
    private final ReservaRepository reservaRepository;

    // Registro de reserva
    @PostMapping("/registro")
    public ResponseEntity<ReservaDTO> registrarReserva(@RequestBody RegistroReservaDTO registroReservaDTO) {
        ReservaDTO dto = reservaService.crearReserva(registroReservaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Actualizacion de estado de reserva
    @PutMapping("/estado")
    public ResponseEntity<Reserva> actualizarEstado(@RequestBody ActualizarEstadoDTO dto) {
        Reserva reservaActualizada = reservaService.actualizarEstadoReserva(dto);
        return ResponseEntity.ok(reservaActualizada);
    }

    // Modificar datos de reserva ya existente
    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> actualizarReserva(
            @PathVariable Long id,
            @RequestBody ActualizarReservaDTO dto) {

        dto.setReservaId(id); // aseguro que use el ID de la URL
        ReservaDTO actualizada = reservaService.actualizarReserva(dto);
        return ResponseEntity.ok(actualizada);
    }

    // Obtener reservas por nombre y apellido del cliente
    @GetMapping("/cliente/{nombre}/{apellido}")
    public ResponseEntity<List<ReservaDTO>> obtenerReservasPorCliente(@PathVariable String nombre, @PathVariable String apellido) {
        List<Reserva> reservas = reservaService.listarPorClienteNombreApellido(nombre, apellido);
        List<ReservaDTO> reservasDTO = reservas.stream()
                .map(reservaMapper::toDTO)
                .toList();
        return ResponseEntity.ok(reservasDTO);
    }

    @GetMapping("/checkin")
    public ResponseEntity<List<CheckInOutDTO>> getCheckInHoy() {
        List<CheckInOutDTO> checkIns = reservaService.obtenerCheckInHoy();
        return ResponseEntity.ok(checkIns);
    }

    @GetMapping("/checkout")
    public ResponseEntity<List<CheckInOutDTO>> getCheckOutHoy() {
        List<CheckInOutDTO> checkOuts = reservaService.obtenerCheckOutHoy();
        return ResponseEntity.ok(checkOuts);
    }

    /**
     * MODIFICACIÓN 1:. Este es el endpoint principal que llamará el calendario
     * para dibujarse. Recibe el año y el mes (ej:
     * /reservas/por-mes?anio=2025&mes=10)
     */
    @GetMapping("/por-mes")
    public ResponseEntity<List<ReservaDTO>> getReservasDelMes(
            @RequestParam int anio,
            @RequestParam int mes) {

        LocalDate inicioMes = LocalDate.of(anio, mes, 1);
        LocalDate finMes = inicioMes.withDayOfMonth(inicioMes.lengthOfMonth());

        List<ReservaDTO> reservas = reservaService.listarPorRangoDeFechas(inicioMes, finMes);
        return ResponseEntity.ok(reservas);
    }

    /**
     * ENDPOINT CORREGIDO: Acepta todos los parámetros opcionales. Llama al
     * método del servicio que maneja todos los criterios.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ReservaDTO>> buscar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String apellido,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta
    ) {
        // Normalización
        if (nombre != null && nombre.isBlank()) {
            nombre = null;
        }
        if (apellido != null && apellido.isBlank()) {
            apellido = null;
        }
        if (fechaDesde != null && fechaDesde.isBlank()) {
            fechaDesde = null;
        }
        if (fechaHasta != null && fechaHasta.isBlank()) {
            fechaHasta = null;
        }

        LocalDate fechaDesdeDate = fechaDesde != null ? LocalDate.parse(fechaDesde) : null;
        LocalDate fechaHastaDate = fechaHasta != null ? LocalDate.parse(fechaHasta) : null;

        List<Reserva> resultados = reservaRepository.findReservasByCriteria(
                nombre,
                apellido,
                fechaDesdeDate,
                fechaHastaDate
        );

        if (resultados.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<ReservaDTO> dtos = resultados.stream()
                .map(reservaMapper::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * MODIFICACIÓN 3:. El modal del calendario necesita esto para poder
     * eliminar una reserva.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    /**
     * Endpoint para el modal "Ver Detalles" de habitaciones. Busca la reserva
     * activa (huésped actual) para una habitación.
     */
    @GetMapping("/habitacion/actual/{idHabitacion}")
    public ResponseEntity<ReservaDTO> getReservaActualPorHabitacion(@PathVariable Long idHabitacion) {

        // Llamamos al nuevo método del servicio (que crearás en el Paso 3)
        ReservaDTO reservaActiva = reservaService.obtenerReservaActivaPorHabitacion(idHabitacion);

        if (reservaActiva == null) {
            // Es normal que no se encuentre, significa que la habitación está libre
            return ResponseEntity.noContent().build(); // 204 No Content
        }

        return ResponseEntity.ok(reservaActiva);
    }
}
