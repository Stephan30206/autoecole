package com.autoecole.backend.controller;

import com.autoecole.backend.dto.ResultatRequest;
import com.autoecole.backend.dto.ResultatResponse;
import com.autoecole.backend.service.ResultatService;
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
@RequestMapping("/api/resultats")
@RequiredArgsConstructor
public class ResultatController {

    private final ResultatService service;

    // GET /api/resultats?eleveId=1
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ELEVE')")
    public List<ResultatResponse> parEleve(@RequestParam(required = false) Long eleveId, Authentication authentication) {
        AuthPrincipal principal = (AuthPrincipal) authentication.getPrincipal();
        if ("ELEVE".equals(principal.role())) {
            if (eleveId != null && !eleveId.equals(principal.eleveId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
            }
            return service.parEleve(principal.eleveId());
        }
        return eleveId == null ? service.tousLesResultats() : service.parEleve(eleveId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResultatResponse creer(@RequestBody @Valid ResultatRequest req) {
        return service.creer(req);
    }
}
