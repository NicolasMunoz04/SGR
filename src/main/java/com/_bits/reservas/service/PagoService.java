package com._bits.reservas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com._bits.reservas.DTO.PagoDTO;
import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.entity.Pago;
import com._bits.reservas.entity.Pago.MetodoPago;
import com._bits.reservas.entity.Reserva;
import com._bits.reservas.mapper.PagoMapper;
import com._bits.reservas.repository.PagoRepository;
import com._bits.reservas.repository.ReservaRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    // Asumo que el mapper se inyecta o es un bean
    private final PagoMapper pagoMapper;

    public Pago generarPago(Long reservaId, MetodoPago metodoPago) {
        // Busca reserva por ID, si no la encuentro lanza un error
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Obtenemos la habitacion y calculamos monto total y seña
        Habitacion habitacion = reserva.getHabitacion();
        long dias = ChronoUnit.DAYS.between(reserva.getFechaInicio(), reserva.getFechaFin());
        if (dias <= 0) {
            dias = 1; // Tiene que haber al menos un dia :)
        }
        BigDecimal montoTotal = habitacion.getPrecio().multiply(BigDecimal.valueOf(dias)); // Calculo para el monto total (precio * dias)
        BigDecimal senia = montoTotal.multiply(new BigDecimal("0.5")); // La seña es el 50% del monto total

        // [NUEVO] Calculamos el 'debe' inicial
        BigDecimal debeInicial = montoTotal.subtract(senia);

        // Creamos el pago
        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(montoTotal);
        pago.setSenia(senia);

        // [NUEVO] Establecemos los valores iniciales para 'pagoRealizado' y 'debe'
        pago.setPagoRealizado(BigDecimal.ZERO); // Al crear, el pago adicional es CERO
        pago.setDebe(debeInicial); // El 'debe' inicial es Total - Seña

        pago.setMetodoPago(metodoPago); // Viene del frontend
        pago.setFechaPago(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    public PagoDTO updatePago(Long pagoId, PagoDTO pagoDTO) {
        // 1. Buscar el pago existente
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con ID: " + pagoId));

        // 2. Actualizar los campos desde el DTO
        // (No actualizamos la seña, asumimos que es fija)
        pago.setMonto(pagoDTO.getMonto());

        // [IMPORTANTE] Asumimos que el DTO trae el *nuevo total* de pagos realizados,
        // no un pago para *sumar* al existente.
        pago.setPagoRealizado(pagoDTO.getPagoRealizado()); // El nuevo valor de pagos adicionales
        pago.setMetodoPago(pagoDTO.getMetodoPago());

        BigDecimal debeActualizado = pago.getMonto()
                .subtract(pago.getSenia()) // Restar la seña original
                .subtract(pago.getPagoRealizado()); // Restar los pagos adicionales

        pago.setDebe(debeActualizado.max(BigDecimal.ZERO)); // Asegurar que no sea negativo

        // 4. Guardar y devolver DTO
        Pago pagoGuardado = pagoRepository.save(pago);

        // Asumo que tienes un mapper (ej. MapStruct) para convertir Entidad a DTO
        return pagoMapper.toDTO(pagoGuardado);
    }
}
