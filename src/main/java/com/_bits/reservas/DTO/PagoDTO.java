package com._bits.reservas.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com._bits.reservas.entity.Pago.MetodoPago;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PagoDTO {

    private Long pagoId;
    private BigDecimal monto;
    private BigDecimal senia;
    private BigDecimal debe;
    private BigDecimal pagoRealizado;
    private LocalDateTime fechaPago;
    private MetodoPago metodoPago;

}
