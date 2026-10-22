package com.autoecole.backend.dto;

public record LoginResponse(String token, String role, Long eleveId, String nom, String prenom, String email) {
}
