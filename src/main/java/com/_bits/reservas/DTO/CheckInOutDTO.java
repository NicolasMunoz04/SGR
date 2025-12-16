package com._bits.reservas.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckInOutDTO {

    private Long reservaId;
    private String nombreCliente;
    private String apellidoCliente;
    private String numeroHabitacion;
    private LocalDate fechaEntrada;
    private LocalDate fechaSalida;
    // Datos de pago
    private BigDecimal montoTotal;
    private BigDecimal senia;
    private BigDecimal debe;
    private BigDecimal pagoRealizado;
}
