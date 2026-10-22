package com.autoecole.backend.controller;

import com.autoecole.backend.entity.Eleve;
import com.autoecole.backend.repository.EleveRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/eleves")
@RequiredArgsConstructor
public class EleveController {

    private final EleveRepository repo;

    @GetMapping
    public List<Eleve> tous() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Eleve un(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Eleve introuvable"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Eleve creer(@RequestBody @Valid Eleve eleve) {
        eleve.setId(null);
        return repo.save(eleve);
    }

    @PutMapping("/{id}")
    public Eleve modifier(@PathVariable Long id, @RequestBody Eleve data) {
        Eleve e = un(id);
        e.setNom(data.getNom());
        e.setPrenom(data.getPrenom());
        e.setTelephone(data.getTelephone());
        return repo.save(e);
    }
}
