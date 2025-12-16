package com._bits.reservas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com._bits.reservas.entity.Cliente;
import com._bits.reservas.repository.ClienteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    // Listar todos los clientes
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // Buscar un cliente por ID con manejo de excepción si no se encuentra
    public Cliente buscarPorId(Long cliente_id) {
        return clienteRepository.findById(cliente_id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    // Método para crear un nuevo cliente con validación
    // De todas formas el cliente se crea con la reserva
    public Cliente crear(Cliente cliente) {
        // lógica de negocio: no permitir clientes sin email
        if (cliente.getEmail() == null || cliente.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        return clienteRepository.save(cliente);
    }

    // Elimina un cliente
    public void eliminar(Long cliente_id) {
        clienteRepository.deleteById(cliente_id);
    }
}
