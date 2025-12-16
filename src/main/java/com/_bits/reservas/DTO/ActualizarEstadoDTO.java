package com._bits.reservas.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActualizarEstadoDTO {
    private Long reservaId;
    private String nuevoEstado;
}
