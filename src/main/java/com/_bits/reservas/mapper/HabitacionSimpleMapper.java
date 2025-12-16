package com._bits.reservas.mapper;

import org.springframework.stereotype.Component;

import com._bits.reservas.DTO.HabitacionDisponibleDTO;
import com._bits.reservas.entity.Habitacion;

@Component
public class HabitacionSimpleMapper {
    
    public HabitacionDisponibleDTO toDTO(Habitacion habitacion) {
        HabitacionDisponibleDTO dto = new HabitacionDisponibleDTO();
        dto.setHabitacionId(habitacion.getHabitacionId());
        dto.setNumero(habitacion.getNumero());
        dto.setTipoNombre(habitacion.getTipoHabitacion().getNombre());
        return dto;
    }

}
