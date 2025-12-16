package com._bits.reservas.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActualizarEstadoHabDTO {
    private Long habitacionId;
    private String nuevoEstado;
}
