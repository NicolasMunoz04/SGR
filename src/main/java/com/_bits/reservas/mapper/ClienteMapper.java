package com._bits.reservas.mapper;

import org.springframework.stereotype.Component;

import com._bits.reservas.DTO.ClienteDTO;
import com._bits.reservas.entity.Cliente;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setClienteId(dto.getClienteId());  // si es update, ya trae ID
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setEmail(dto.getEmail());
        cliente.setTelefono(dto.getTelefono());
        return cliente;
    }

    public ClienteDTO toDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setClienteId(cliente.getClienteId());
        dto.setNombre(cliente.getNombre());
        dto.setApellido(cliente.getApellido());
        dto.setEmail(cliente.getEmail());
        dto.setTelefono(cliente.getTelefono());
        return dto;
    }
}
