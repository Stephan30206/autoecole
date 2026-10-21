package com.autoecole.backend.repository;

import com.autoecole.backend.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamenRepository extends JpaRepository<Examen, Long> { }