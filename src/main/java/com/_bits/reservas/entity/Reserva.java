package com._bits.reservas.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reserva")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Reserva {

    public enum EstadoReserva {
        pendiente,
        confirmada,
        cancelada
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reserva_id")
    private Long reservaId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "cantidad_personas", nullable = false)
    private int cantidadPersonas;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoReserva estado = EstadoReserva.pendiente;

    // ⭐ MUCHAS reservas → UN cliente
    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // ⭐ MUCHAS reservas → UNA habitación
    @ManyToOne(optional = false)
    @JoinColumn(name = "habitacion_id", nullable = false)
    @JsonBackReference
    private Habitacion habitacion;

    @OneToOne(mappedBy = "reserva", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Pago pago;

}
