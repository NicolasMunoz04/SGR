package com._bits.reservas.mapper;

import org.springframework.stereotype.Component;

import com._bits.reservas.DTO.PagoDTO;
import com._bits.reservas.entity.Pago;

@Component
public class PagoMapper {

    public Pago toEntity(PagoDTO dto) {
        Pago pago = new Pago();
        pago.setPagoId(dto.getPagoId()); // si es update, ya trae ID
        pago.setMonto(dto.getMonto());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setSenia(dto.getSenia());
        pago.setDebe(dto.getDebe());
        pago.setPagoRealizado(dto.getPagoRealizado());
        return pago;
    }

    public PagoDTO toDTO(Pago pago) {
        PagoDTO dto = new PagoDTO();
        dto.setPagoId(pago.getPagoId());
        dto.setMonto(pago.getMonto());
        dto.setFechaPago(pago.getFechaPago());
        dto.setMetodoPago(pago.getMetodoPago());
        dto.setSenia(pago.getSenia());
        dto.setDebe(pago.getDebe());
        dto.setPagoRealizado(pago.getPagoRealizado());
        return dto;
    }

}
