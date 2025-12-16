package com._bits.reservas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com._bits.reservas.entity.Tipo_habitacion;

@Repository
public interface Tipo_habitacionRepository extends JpaRepository<Tipo_habitacion, Long> {
    Optional<Tipo_habitacion> findByNombre(String nombre);
    Boolean existsByNombre(String nombre);

}
