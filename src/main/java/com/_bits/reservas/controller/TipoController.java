package com._bits.reservas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._bits.reservas.DTO.TipoDTO;
import com._bits.reservas.service.Tipo_HabitacionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tipos")
public class TipoController {

    private final Tipo_HabitacionService tipoService;

    @GetMapping("/listar")
    public ResponseEntity<List<TipoDTO>> listarTipos() {
        return ResponseEntity.ok(tipoService.obtenerTodos());
    }

    @PostMapping("/crearTipo")
    public ResponseEntity<TipoDTO> crear(@RequestBody TipoDTO dto) {
        TipoDTO nuevo = tipoService.crearTipo(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }
}
