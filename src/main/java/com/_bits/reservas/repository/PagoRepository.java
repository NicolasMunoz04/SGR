package com._bits.reservas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com._bits.reservas.entity.Pago;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
}
