package com._bits.reservas.DTO;

import java.time.LocalDate;

import com._bits.reservas.entity.Reserva.EstadoReserva;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroReservaDTO {
    // Datos de cliente
    private ClienteDTO cliente;
    // Datos de habitacion
    private HabitacionDTO habitacion;
    // Datos de pago
    private PagoDTO pago;
    // Datos de reserva
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private int cantidadPersonas;
    private EstadoReserva estado; // "CONFIRMADA", "CANCELADA", "PENDIENTE"
}
