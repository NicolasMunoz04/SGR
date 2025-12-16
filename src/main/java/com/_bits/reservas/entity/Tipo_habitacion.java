package com._bits.reservas.entity;

import java.util.List;

import jakarta.persistence.Id;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_habitacion")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Tipo_habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tipo_id")
    private Long tipoId;

    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    @Column(name = "descripcion", nullable = false)
    private String descripcion; 
    

    @OneToMany(mappedBy = "tipoHabitacion")
    private List<Habitacion> habitaciones;
}
