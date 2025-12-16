package com._bits.reservas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontRecepController {

    @GetMapping("/habitacion")
    public String habitaciones() {
        return "redirect:/recepcion/html/habitaciones.html";
    }

    @GetMapping("/check-habitaciones")
    public String checkout() {
        return "redirect:/recepcion/html/checkinout.html";
    }

    @GetMapping("/crear-reserva")
    public String crearReserva() {
        return "redirect:/recepcion/html/crearReserva.html";
    }

    @GetMapping("/calendario")
    public String calendario() {
        return "redirect:/recepcion/html/calendario.html";
    }
}
