package com.autoecole.backend.security;

public record AuthPrincipal(Long accountId, String email, String role, Long eleveId) {
}
