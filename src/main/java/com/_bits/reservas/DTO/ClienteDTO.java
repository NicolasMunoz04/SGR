package com._bits.reservas.DTO;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// Este DTO se usa para crear clientes de prueba, por las dudas...
public class ClienteDTO {
    @NotNull
    private Long ClienteId;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private LocalDateTime fecha_registro;
    
}
