package com.autoecole.backend.controller;

import com.autoecole.backend.entity.Examen;
import com.autoecole.backend.repository.ExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/examens")
@RequiredArgsConstructor
public class ExamenController {

    private final ExamenRepository repo;

    @GetMapping
    public List<Examen> tous() { return repo.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Examen creer(@RequestBody Examen e) {
        e.setId(null);
        return repo.save(e);
    }
}