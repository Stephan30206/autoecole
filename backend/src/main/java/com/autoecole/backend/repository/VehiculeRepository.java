package com.autoecole.backend.repository;

import com.autoecole.backend.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> { }