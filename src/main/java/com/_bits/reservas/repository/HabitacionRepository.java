package com._bits.reservas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.entity.Habitacion.EstadoHabitacion;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long>  {
    List<Habitacion> findByEstado(EstadoHabitacion estado);
    long countByEstado(Habitacion.EstadoHabitacion estado);
    boolean existsByNumero(String numero);
}
