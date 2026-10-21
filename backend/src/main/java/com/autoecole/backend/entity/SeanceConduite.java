package com.autoecole.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "seance_conduite")
@Getter @Setter @NoArgsConstructor
public class SeanceConduite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seance")
    private Long id;

    @Column(name = "date_seance", nullable = false)
    private LocalDate dateSeance;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(nullable = false)
    private Integer duree;   // en minutes

    @Column(nullable = false)
    private String statut = "PROGRAMMEE";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_eleve")
    private Eleve eleve;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_moniteur")
    private Moniteur moniteur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_vehicule")
    private Vehicule vehicule;
}