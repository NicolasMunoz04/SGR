package com._bits.reservas.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com._bits.reservas.entity.Habitacion;
import com._bits.reservas.entity.Reserva;
import com._bits.reservas.entity.Reserva.EstadoReserva;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByClienteClienteId(Long clienteId);

    List<Reserva> findByFechaInicio(LocalDate fechaInicio);

    List<Reserva> findByFechaFin(LocalDate fechaFin);

    List<Reserva> findByCliente_Nombre(String nombre);

    // Contar reservas por estado
    long countByEstado(EstadoReserva estado);

    // Verificar si existe una reserva activa para una habitación específica
    boolean existsByHabitacionAndEstadoIn(Habitacion habitacion, List<String> estados);

    /**
     * CORRECCIÓN: Volvemos a la consulta combinada, usando CAST para
     * nombre/apellido. Busca por nombre, apellido, fechaDesde y fechaHasta
     * (todos opcionales).
     */
    @Query("""
SELECT r
FROM Reserva r
LEFT JOIN FETCH r.cliente c
LEFT JOIN FETCH r.habitacion h
LEFT JOIN FETCH h.tipoHabitacion t
WHERE 
    (:nombre IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
AND 
    (:apellido IS NULL OR LOWER(c.apellido) LIKE LOWER(CONCAT('%', :apellido, '%')))
AND 
    (
        (:fechaDesde IS NULL AND :fechaHasta IS NULL)
        OR (
            :fechaDesde IS NOT NULL 
            AND :fechaHasta IS NOT NULL
            AND r.fechaInicio <= :fechaHasta
            AND r.fechaFin >= :fechaDesde
        )
    )
""")
    List<Reserva> findReservasByCriteria(
            @Param("nombre") String nombre,
            @Param("apellido") String apellido,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta
    );

    /**
     * MODIFICACIÓN: Añadir esta consulta. Busca reservas cuyas fechas (inicio a
     * fin) se solapen con un rango dado (inicioMes a finMes). El calendario
     * usará esto para saber qué dibujar.
     */
    @Query("SELECT r FROM Reserva r WHERE r.fechaInicio <= :finMes AND r.fechaFin >= :inicioMes")
    List<Reserva> findReservasInDateRange(@Param("inicioMes") LocalDate inicioMes, @Param("finMes") LocalDate finMes);

    /**
     * Busca la reserva activa (confirmada o pendiente) para una habitación
     * específica en la fecha actual (hoy).
     */
    @Query("SELECT r FROM Reserva r WHERE r.habitacion.habitacionId = :habitacionId "
            + "AND :hoy >= r.fechaInicio "
            + "AND :hoy <= r.fechaFin "
            + "AND (r.estado = com._bits.reservas.entity.Reserva.EstadoReserva.confirmada OR r.estado = com._bits.reservas.entity.Reserva.EstadoReserva.pendiente)")
    Optional<Reserva> findReservaActivaPorHabitacion(
            @Param("habitacionId") Long habitacionId,
            @Param("hoy") LocalDate hoy);
}
