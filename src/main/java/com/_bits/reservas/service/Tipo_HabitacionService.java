package com._bits.reservas.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com._bits.reservas.DTO.TipoDTO;
import com._bits.reservas.entity.Tipo_habitacion;
import com._bits.reservas.mapper.TipoHabitacionMapper;
import com._bits.reservas.repository.Tipo_habitacionRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class Tipo_HabitacionService {
    private final Tipo_habitacionRepository tipoHabitacionRepository;
    private final TipoHabitacionMapper tipoHabitacionMapper;

    // Obtenemos todos los tipos de habitación existentes
    public List<TipoDTO> obtenerTodos() {
        List<Tipo_habitacion> tipos = tipoHabitacionRepository.findAll();
        return tipos.stream().map(tipoHabitacionMapper::toDTO).collect(Collectors.toList());
    }

    // Crear un nuevo tipo de habitación
    public TipoDTO crearTipo (TipoDTO dto){
        // Verifica si ya existe un tipo de habitacion con el mismo nombre
        if (tipoHabitacionRepository.existsByNombre(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe un tipo de habitacion con ese nombre.");
        }

        // Despues de la validacion, mapea y guarda el nuevo tipo de habitacion
        Tipo_habitacion tipo = tipoHabitacionMapper.toEntity(dto);
        tipoHabitacionRepository.save(tipo);
        return tipoHabitacionMapper.toDTO(tipo);  

    }
    
}
