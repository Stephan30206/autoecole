package com.autoecole.backend.controller;

import com.autoecole.backend.dto.SeanceRequest;
import com.autoecole.backend.dto.SeanceResponse;
import com.autoecole.backend.service.SeanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.autoecole.backend.security.AuthPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
public class SeanceController {

    private final SeanceService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ELEVE')")
    public List<SeanceResponse> historique(@RequestParam(required = false) Long eleveId, Authentication authentication) {
        AuthPrincipal principal = (AuthPrincipal) authentication.getPrincipal();
        if ("ELEVE".equals(principal.role())) {
            if (eleveId != null && !eleveId.equals(principal.eleveId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
            }
            return service.historiqueEleve(principal.eleveId());
        }
        return eleveId == null ? service.toutesLesSeances() : service.historiqueEleve(eleveId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SeanceResponse creer(@RequestBody @Valid SeanceRequest req) {
        return service.creer(req);
    }
}
