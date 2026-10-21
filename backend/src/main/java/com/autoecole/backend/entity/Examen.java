package com.autoecole.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "examen")
@Getter @Setter @NoArgsConstructor
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_examen")
    private Long id;

    @Column(name = "type_examen", nullable = false)
    private String typeExamen;   // CODE ou CONDUITE

    @Column(name = "date_examen", nullable = false)
    private LocalDate dateExamen;

    @Column(nullable = false)
    private String lieu;
}