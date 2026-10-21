package com.autoecole.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "resultat_examen")
@Getter @Setter @NoArgsConstructor
public class ResultatExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resultat")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_eleve")
    private Eleve eleve;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_examen")
    private Examen examen;

    private BigDecimal note;

    @Column(nullable = false)
    private String resultat = "EN_ATTENTE";
}