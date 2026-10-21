package com.autoecole.backend.repository;

import com.autoecole.backend.entity.Eleve;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EleveRepository extends JpaRepository<Eleve, Long> { }