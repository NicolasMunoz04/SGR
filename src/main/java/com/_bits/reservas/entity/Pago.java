package com._bits.reservas.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pago")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Pago {

    public enum MetodoPago {
        efectivo,
        tarjeta,
        transferencia
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pago_id")
    private Long pagoId;

    @Column(name = "monto", nullable = false)
    private BigDecimal monto;

    @Column(name = "fecha_pago", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaPago;

    @Enumerated(EnumType.STRING) // guarda el nombre del enum ("PENDIENTE", etc.)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "senia", nullable = false)
    private BigDecimal senia;

    @Column(name = "debe", nullable = false)
    private BigDecimal debe;

    @Column(name = "pago_realizado", nullable = false)
    private BigDecimal pagoRealizado;

    @OneToOne
    @JoinColumn(name = "reserva_id", unique = true)
    @JsonIgnore
    private Reserva reserva;
}
