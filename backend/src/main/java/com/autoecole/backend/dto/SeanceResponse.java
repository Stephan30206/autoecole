package com.autoecole.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SeanceResponse(
        Long id,
        LocalDate dateSeance,
        LocalTime heureDebut,
        Integer duree,
        String statut,
        Long eleveId,
        String eleveNom,
        String moniteurNom,
        String vehicule
) { }