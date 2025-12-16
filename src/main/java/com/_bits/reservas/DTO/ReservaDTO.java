package com._bits.reservas.DTO;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservaDTO {

    private Long reservaId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private int cantidadPersonas;
    private String estado;

    private ClienteDTO cliente;
    private PagoDTO pago;           // 🔥 FUNDAMENTAL
    private HabitacionDTO habitacion;
}
