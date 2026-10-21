package com.autoecole.backend.repository;

import com.autoecole.backend.entity.Moniteur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoniteurRepository extends JpaRepository<Moniteur, Long> {
    List<Moniteur> findByActifTrue();
}