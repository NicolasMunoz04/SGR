package com._bits.reservas.DTO;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HabitacionDTO {
    // Datos de tipo_habitacion
    private Long tipoId;

    // ✅ CAMBIO 1: AÑADIDOS
    // El frontend necesita estos datos para mostrar en la lista y en los detalles
    private String tipoNombre;
    private String tipoDescripcion;
    
    
    // Datos de habitacion
    private Long habitacionId;
    private String estado;
    private String numero;
    private BigDecimal precio;  
}
