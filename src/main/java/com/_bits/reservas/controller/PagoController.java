package com._bits.reservas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._bits.reservas.DTO.PagoDTO;
import com._bits.reservas.entity.Pago.MetodoPago;
import lombok.AllArgsConstructor;
// import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/pagos")
public class PagoController {

    // private final PagoService pagoService;
    // Endpoint para devolver los métodos de pago disponibles
    @GetMapping("/metodos")
    public MetodoPago[] obtenerMetodosPago() {
        return MetodoPago.values();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PagoDTO> actualizarPago(@PathVariable Long id, @RequestBody PagoDTO pagoDTO) {
        // Validamos que el ID del DTO coincida (buena práctica)
        if (pagoDTO.getPagoId() == null || !pagoDTO.getPagoId().equals(id)) {
            // Opcional: setear el ID desde la URL
            pagoDTO.setPagoId(id);
        }

        PagoDTO pagoActualizado = pagoService.updatePago(id, pagoDTO);
        return ResponseEntity.ok(pagoActualizado);
    }

}
