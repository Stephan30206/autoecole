package com.autoecole.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 100) String nom,
        @NotBlank @Size(max = 100) String prenom,
        @Size(max = 40) String telephone,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 10, max = 72) String password) {
}
