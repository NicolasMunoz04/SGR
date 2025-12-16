package com._bits.reservas.service;

import java.util.List;
import java.util.stream.Collectors; // Importar Collectors

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com._bits.reservas.DTO.HabitacionDTO;
import com._bits.reservas.DTO.HabitacionDisponibleDTO;
import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.entity.Tipo_habitacion;
// import com._bits.reservas.mapper.HabitacionMapper; // Ya no lo usamos aquí
import com._bits.reservas.mapper.HabitacionSimpleMapper;
import com._bits.reservas.repository.HabitacionRepository;
import com._bits.reservas.repository.Tipo_habitacionRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    // private final HabitacionMapper habitacionMapper; // CAMBIO: Eliminado
    private final Tipo_habitacionRepository tipoHabitacionRepository;
    private final HabitacionSimpleMapper habitacionSimpleMapper;

    // Crear una habitación nueva
    @Transactional
    public HabitacionDTO crear(HabitacionDTO dto) {
        if (dto.getTipoId() == null) {
            throw new IllegalArgumentException("Debe seleccionar un tipo de habitación.");
        }

        Tipo_habitacion tipoHabitacion = tipoHabitacionRepository.findById(dto.getTipoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de habitación no encontrado."));

        // CAMBIO: Mapeo manual para asegurar consistencia
        Habitacion habitacion = new Habitacion();
        habitacion.setNumero(dto.getNumero());
        habitacion.setPrecio(dto.getPrecio());
        habitacion.setTipoHabitacion(tipoHabitacion);
        // El estado por defecto se asigna en la Entidad
        if (dto.getEstado() != null) {
             habitacion.setEstado(Habitacion.EstadoHabitacion.valueOf(dto.getEstado().toLowerCase()));
        }

        Habitacion guardada = habitacionRepository.save(habitacion);
        return toDTO(guardada); // Usamos nuestro mapeador local
    }

    // Listar todas las habitaciones
    public List<HabitacionDTO> listarTodas() {
        // CAMBIO: Mapeo manual para incluir datos del TipoHabitacion
        return habitacionRepository.findAll()
                .stream()
                .map(this::toDTO) // Usamos nuestro mapeador local
                .collect(Collectors.toList()); // Importar Collectors
    }

    // Listar habitaciones por estado
    public List<Habitacion> listarPorEstado(Habitacion.EstadoHabitacion estado) {
        return habitacionRepository.findByEstado(estado);
    }

    // Actualizar habitación completa
    @Transactional
    public HabitacionDTO actualizarHabitacion(HabitacionDTO dto) {
        Habitacion habitacion = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada."));

        if (dto.getNumero() != null) {
            habitacion.setNumero(dto.getNumero());
        }
        if (dto.getPrecio() != null) {
            habitacion.setPrecio(dto.getPrecio());
        }
        // CAMBIO: Permitir actualizar el estado desde el modal de edición
        if (dto.getEstado() != null) {
            try {
                Habitacion.EstadoHabitacion estadoEnum = Habitacion.EstadoHabitacion.valueOf(dto.getEstado().toLowerCase());
                habitacion.setEstado(estadoEnum);
            } catch (Exception e) {
                // No hacer nada si el estado es inválido
            }
        }
        if (dto.getTipoId() != null) {
            Tipo_habitacion tipo = tipoHabitacionRepository.findById(dto.getTipoId())
                    .orElseThrow(() -> new IllegalArgumentException("Tipo de habitación no encontrado."));
            habitacion.setTipoHabitacion(tipo);
        }

        Habitacion guardada = habitacionRepository.save(habitacion);
        return toDTO(guardada); // Usamos nuestro mapeador local
    }

    // Eliminar habitación por ID
    public boolean eliminarHabitacion(Long id) {
        if (!habitacionRepository.existsById(id)) {
            return false;
        }
        habitacionRepository.deleteById(id);
        return true;
    }

    // Obtener habitaciones disponibles
    public List<HabitacionDisponibleDTO> obtenerDisponibles() {
        return habitacionRepository.findByEstado(Habitacion.EstadoHabitacion.disponible)
                .stream()
                .map(habitacionSimpleMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener una habitación por ID
    public HabitacionDTO obtenerPorId(Long id) {
        // CAMBIO: Mapeo manual
        return habitacionRepository.findById(id)
                .map(this::toDTO) // Usamos nuestro mapeador local
                .orElse(null);
    }

    // Actualizar estado de una habitación
    @Transactional
    public Habitacion actualizarEstadoHabitacion(Long habitacionId, String nuevoEstado) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada."));
        try {
            Habitacion.EstadoHabitacion estado = Habitacion.EstadoHabitacion.valueOf(nuevoEstado.toLowerCase());
            habitacion.setEstado(estado);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }
        return habitacionRepository.save(habitacion);
    }


    // --- CAMBIO: NUEVO MÉTODO DE MAPEO MANUAL ---
    // Este método reemplaza al HabitacionMapper y SÍ rellena todos los datos
    private HabitacionDTO toDTO(Habitacion habitacion) {
        if (habitacion == null) {
            return null;
        }
        HabitacionDTO dto = new HabitacionDTO();
        dto.setHabitacionId(habitacion.getHabitacionId());
        dto.setNumero(habitacion.getNumero());
        dto.setPrecio(habitacion.getPrecio());
        if (habitacion.getEstado() != null) {
            dto.setEstado(habitacion.getEstado().name());
        }

        // Rellenamos los datos del tipo
        if (habitacion.getTipoHabitacion() != null) {
            dto.setTipoId(habitacion.getTipoHabitacion().getTipoId());
            dto.setTipoNombre(habitacion.getTipoHabitacion().getNombre());
            dto.setTipoDescripcion(habitacion.getTipoHabitacion().getDescripcion());
            
        }
        return dto;
    }
}
