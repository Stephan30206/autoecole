package com.autoecole.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record SeanceRequest(
        @NotNull LocalDate dateSeance,
        @NotNull LocalTime heureDebut,
        @NotNull @Min(15) Integer duree,
        @NotNull Long idEleve,
        @NotNull Long idMoniteur,
        @NotNull Long idVehicule
) { }