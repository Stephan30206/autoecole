package com.autoecole.backend.controller;

import com.autoecole.backend.dto.LoginRequest;
import com.autoecole.backend.dto.LoginResponse;
import com.autoecole.backend.dto.RegisterRequest;
import com.autoecole.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Map.of("message", "Un e-mail de vérification a été envoyé.");
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/verify")
    public Map<String, String> verify(@RequestParam String token) {
        authService.verify(token);
        return Map.of("message", "Adresse e-mail vérifiée. Vous pouvez maintenant vous connecter.");
    }
}
