package com._bits.reservas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontClieController {

    @GetMapping("/")
    public String index() {
        return "redirect:/cliente/HTML/Index.html";
    }

    @GetMapping("/habitaciones")
    public String habitaciones() {
        return "redirect:/cliente/HTML/Habitaciones.html";
    }

    @GetMapping("/blog")
    public String blog() {
        return "redirect:/cliente/HTML/Blog.html";
    }

    @GetMapping("/contacto")
    public String contacto() {
        return "redirect:/cliente/HTML/Contacto.html";
    }
    
    @GetMapping("/registro")
    public String registro() {
        return "redirect:/cliente/HTML/Registro.html";
    }

    @GetMapping("/reserva")
    public String reserva() {
        return "redirect:/cliente/HTML/Reserva.html";
    }
    
    @GetMapping("/blogs")
    public String blogDetalle() {
        return "redirect:/cliente/HTML/BlogDetalle.html";
    }

}
