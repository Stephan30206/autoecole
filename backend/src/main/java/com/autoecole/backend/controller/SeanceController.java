package com.autoecole.backend.controller;

import com.autoecole.backend.dto.SeanceRequest;
import com.autoecole.backend.dto.SeanceResponse;
import com.autoecole.backend.service.SeanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
public class SeanceController {

    private final SeanceService service;

    // GET /api/seances?eleveId=1
    @GetMapping
    public List<SeanceResponse> historique(@RequestParam Long eleveId) {
        return service.historiqueEleve(eleveId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeanceResponse creer(@RequestBody @Valid SeanceRequest req) {
        return service.creer(req);
    }
}