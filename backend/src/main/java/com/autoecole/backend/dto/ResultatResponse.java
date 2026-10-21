package com.autoecole.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResultatResponse(
        Long id,
        String typeExamen,
        LocalDate dateExamen,
        String lieu,
        BigDecimal note,
        String resultat
) { }