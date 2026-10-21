package com.autoecole.backend.service;

import com.autoecole.backend.dto.SeanceRequest;
import com.autoecole.backend.dto.SeanceResponse;
import com.autoecole.backend.entity.*;
import com.autoecole.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeanceService {

    private final SeanceRepository seanceRepo;
    private final EleveRepository eleveRepo;
    private final MoniteurRepository moniteurRepo;
    private final VehiculeRepository vehiculeRepo;

    @Transactional(readOnly = true)
    public List<SeanceResponse> historiqueEleve(Long eleveId) {
        return seanceRepo.findByEleveIdOrderByDateSeanceAscHeureDebutAsc(eleveId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public SeanceResponse creer(SeanceRequest req) {
        Eleve eleve = eleveRepo.findById(req.idEleve())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Eleve introuvable"));
        Moniteur moniteur = moniteurRepo.findById(req.idMoniteur())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moniteur introuvable"));
        Vehicule vehicule = vehiculeRepo.findById(req.idVehicule())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicule introuvable"));

        if (!moniteur.isActif()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce moniteur n'est plus actif");
        }

        LocalTime debut = req.heureDebut();
        LocalTime fin = debut.plusMinutes(req.duree());

        boolean moniteurOccupe = seanceRepo
                .findByMoniteurIdAndDateSeance(moniteur.getId(), req.dateSeance())
                .stream().anyMatch(s -> chevauche(s, debut, fin));
        if (moniteurOccupe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le moniteur a deja une seance a cet horaire");
        }

        boolean vehiculeOccupe = seanceRepo
                .findByVehiculeIdAndDateSeance(vehicule.getId(), req.dateSeance())
                .stream().anyMatch(s -> chevauche(s, debut, fin));
        if (vehiculeOccupe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le vehicule est deja reserve a cet horaire");
        }

        SeanceConduite s = new SeanceConduite();
        s.setDateSeance(req.dateSeance());
        s.setHeureDebut(debut);
        s.setDuree(req.duree());
        s.setEleve(eleve);
        s.setMoniteur(moniteur);
        s.setVehicule(vehicule);
        return toResponse(seanceRepo.save(s));
    }

    // Deux creneaux se chevauchent si chacun commence avant la fin de l'autre
    private boolean chevauche(SeanceConduite s, LocalTime debut, LocalTime fin) {
        if ("ANNULEE".equals(s.getStatut())) return false;
        LocalTime sFin = s.getHeureDebut().plusMinutes(s.getDuree());
        return s.getHeureDebut().isBefore(fin) && debut.isBefore(sFin);
    }

    private SeanceResponse toResponse(SeanceConduite s) {
        return new SeanceResponse(
                s.getId(), s.getDateSeance(), s.getHeureDebut(), s.getDuree(), s.getStatut(),
                s.getEleve().getId(),
                s.getEleve().getPrenom() + " " + s.getEleve().getNom(),
                s.getMoniteur().getPrenom() + " " + s.getMoniteur().getNom(),
                s.getVehicule().getMarque() + " " + s.getVehicule().getModele()
                        + " (" + s.getVehicule().getImmatriculation() + ")"
        );
    }
}