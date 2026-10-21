package com.autoecole.backend.controller;

import com.autoecole.backend.entity.Vehicule;
import com.autoecole.backend.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
public class VehiculeController {

    private final VehiculeRepository repo;

    @GetMapping
    public List<Vehicule> tous() { return repo.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vehicule creer(@RequestBody Vehicule v) {
        v.setId(null);
        return repo.save(v);
    }
}