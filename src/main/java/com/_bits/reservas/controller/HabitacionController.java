package com._bits.reservas.controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com._bits.reservas.DTO.*;
import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.service.HabitacionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;

    // Crear una nueva habitación
    @PostMapping("/crear")
    public ResponseEntity<HabitacionDTO> crearHabitacion(@RequestBody HabitacionDTO habitacionDTO) {
        HabitacionDTO nuevaHabitacion = habitacionService.crear(habitacionDTO);
        return ResponseEntity.status(201).body(nuevaHabitacion);
    }

    // Listar todas las habitaciones
    @GetMapping("/listar")
    public ResponseEntity<List<HabitacionDTO>> listarHabitaciones() {
        List<HabitacionDTO> habitaciones = habitacionService.listarTodas();
        if (habitaciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(habitaciones);
    }

    // Listar habitaciones disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<List<HabitacionDisponibleDTO>> listarDisponibles() {
        List<HabitacionDisponibleDTO> disponibles = habitacionService.obtenerDisponibles();
        if (disponibles.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(disponibles);
    }

    // Actualizacion de un estado de habitacion
    @PutMapping("/estado")
    public ResponseEntity<Habitacion> actualizarEstado(@RequestBody ActualizarEstadoHabDTO dto) {
        Habitacion habitacion = habitacionService.actualizarEstadoHabitacion(dto.getHabitacionId(), dto.getNuevoEstado());
        return ResponseEntity.ok(habitacion);
    }

    // Actualizar datos de habitacion existente
    @PutMapping("/modificar/{id}")
    public ResponseEntity<HabitacionDTO> actualizarHabitacion(
            @PathVariable Long id,
            @RequestBody HabitacionDTO dto) {

        dto.setHabitacionId(id); // aseguramos que el ID venga de la URL
        HabitacionDTO actualizada = habitacionService.actualizarHabitacion(dto);
        return ResponseEntity.ok(actualizada);
    }

    // Obtener una habitación por ID (para modales "Ver Detalles" y "Editar")
    @GetMapping("/{id}")
    public ResponseEntity<HabitacionDTO> obtenerPorId(@PathVariable Long id) {
        HabitacionDTO habitacion = habitacionService.obtenerPorId(id);
        if (habitacion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(habitacion);
    }

 
    // El frontend llama a "/eliminar/{id}", no a "/{id}"
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarHabitacion(@PathVariable Long id) {
        boolean eliminada = habitacionService.eliminarHabitacion(id);
        if (eliminada) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.notFound().build();
    }

    // Este endpoint es requerido por "cargarEstadosHabitacionEditar()" en el JS
    @GetMapping("/enums/estadosHabitacion")
    public ResponseEntity<List<String>> getEstadosHabitacion() {
        // Usamos el Enum que está DENTRO de la entidad Habitacion
        List<String> estados = Arrays.stream(Habitacion.EstadoHabitacion.values())
                                     .map(Enum::name) // Convierte (disponible, ocupada, etc.) a ("disponible", "ocupada", etc.)
                                     .collect(Collectors.toList());
        return ResponseEntity.ok(estados);
    }
}
