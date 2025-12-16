package com._bits.reservas.mapper;

import org.springframework.stereotype.Component;

import com._bits.reservas.DTO.TipoDTO;
import com._bits.reservas.entity.Tipo_habitacion;

@Component
public class TipoHabitacionMapper {

    // Convierte TipoDTO a Tipo_habitacion
    public Tipo_habitacion toEntity(TipoDTO tipoDTO) {
        Tipo_habitacion tipoHabitacion = new Tipo_habitacion();
        tipoHabitacion.setNombre(tipoDTO.getNombre());
        tipoHabitacion.setDescripcion(tipoDTO.getDescripcion());
        return tipoHabitacion;
    }

    // Convierte Tipo_habitacion a TipoDTO
    public TipoDTO toDTO(Tipo_habitacion tipoHabitacion) {
        TipoDTO dto = new TipoDTO();
        dto.setTipoId(tipoHabitacion.getTipoId()); // AGREGAR
        dto.setNombre(tipoHabitacion.getNombre());
        dto.setDescripcion(tipoHabitacion.getDescripcion());
        return dto;
    }
    
}
