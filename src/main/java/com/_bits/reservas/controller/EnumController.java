package com._bits.reservas.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._bits.reservas.entity.Habitacion.EstadoHabitacion;
import com._bits.reservas.entity.Reserva.EstadoReserva;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/enums")
public class EnumController {

    // Devuleve las tres opciones dentro del ENUM "EstadosHabitacion"
    @GetMapping("/estadosHabitacion")
    public EstadoHabitacion[] EstadosHabitacion(){
        return EstadoHabitacion.values();
    }

    // Devulve todos los "EstadosReserva" del ENUM
    @GetMapping("/estadosReserva")
    public EstadoReserva[] EstadosReserva(){
        return EstadoReserva.values();
    } 
    
}