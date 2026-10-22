package com.autoecole.backend.controller;

import com.autoecole.backend.dto.ResultatRequest;
import com.autoecole.backend.dto.ResultatResponse;
import com.autoecole.backend.service.ResultatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resultats")
@RequiredArgsConstructor
public class ResultatController {

    private final ResultatService service;

    // GET /api/resultats?eleveId=1
    @GetMapping
    public List<ResultatResponse> parEleve(@RequestParam(required = false) Long eleveId) {
        return eleveId == null ? service.tousLesResultats() : service.parEleve(eleveId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResultatResponse creer(@RequestBody @Valid ResultatRequest req) {
        return service.creer(req);
    }
}
