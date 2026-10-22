package com.autoecole.backend.controller;

import com.autoecole.backend.entity.Moniteur;
import com.autoecole.backend.repository.MoniteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/moniteurs")
@RequiredArgsConstructor
public class MoniteurController {

    private final MoniteurRepository repo;

    @GetMapping
    public List<Moniteur> liste(@RequestParam(defaultValue = "false") boolean actifsSeulement) {
        return actifsSeulement ? repo.findByActifTrue() : repo.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Moniteur creer(@RequestBody Moniteur m) {
        m.setId(null);
        m.setActif(true);
        return repo.save(m);
    }

    // "Supprimer" = desactiver : l'historique des seances est conserve
    @DeleteMapping("/{id}")
    public Moniteur desactiver(@PathVariable Long id) {
        Moniteur m = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moniteur introuvable"));
        m.setActif(false);
        return repo.save(m);
    }
}
