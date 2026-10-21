package com.autoecole.backend.service;

import com.autoecole.backend.dto.ResultatRequest;
import com.autoecole.backend.dto.ResultatResponse;
import com.autoecole.backend.entity.*;
import com.autoecole.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultatService {

    private final ResultatRepository resultatRepo;
    private final EleveRepository eleveRepo;
    private final ExamenRepository examenRepo;

    @Transactional(readOnly = true)
    public List<ResultatResponse> parEleve(Long eleveId) {
        return resultatRepo.findByEleveId(eleveId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResultatResponse creer(ResultatRequest req) {
        Eleve eleve = eleveRepo.findById(req.idEleve())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Eleve introuvable"));
        Examen examen = examenRepo.findById(req.idExamen())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen introuvable"));

        ResultatExamen r = new ResultatExamen();
        r.setEleve(eleve);
        r.setExamen(examen);
        r.setNote(req.note());
        r.setResultat(req.resultat());
        return toResponse(resultatRepo.save(r));
    }

    private ResultatResponse toResponse(ResultatExamen r) {
        return new ResultatResponse(
                r.getId(), r.getExamen().getTypeExamen(), r.getExamen().getDateExamen(),
                r.getExamen().getLieu(), r.getNote(), r.getResultat());
    }
}