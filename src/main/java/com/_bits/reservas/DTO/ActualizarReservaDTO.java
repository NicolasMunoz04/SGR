package com._bits.reservas.DTO;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActualizarReservaDTO {

    private Long reservaId;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private Integer cantidadPersonas;

    private String estado;

    private Long habitacionId;

    private ClienteDTO cliente;

    private PagoDTO pago;   // 🔥🔥🔥 ESTE ES EL QUE TE FALTABA 🔥🔥🔥
}
