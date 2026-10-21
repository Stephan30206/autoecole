package com.autoecole.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ResultatRequest(
        @NotNull Long idEleve,
        @NotNull Long idExamen,
        BigDecimal note,
        @NotNull String resultat   // ADMIS, AJOURNE, EN_ATTENTE
) { }