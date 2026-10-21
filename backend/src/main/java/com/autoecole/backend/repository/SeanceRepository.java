package com.autoecole.backend.repository;

import com.autoecole.backend.entity.SeanceConduite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SeanceRepository extends JpaRepository<SeanceConduite, Long> {

    // Historique d'un eleve (equivalent du mini-lab SQL du cours)
    List<SeanceConduite> findByEleveIdOrderByDateSeanceAscHeureDebutAsc(Long eleveId);

    // Pour detecter les chevauchements
    List<SeanceConduite> findByMoniteurIdAndDateSeance(Long moniteurId, LocalDate date);
    List<SeanceConduite> findByVehiculeIdAndDateSeance(Long vehiculeId, LocalDate date);
}