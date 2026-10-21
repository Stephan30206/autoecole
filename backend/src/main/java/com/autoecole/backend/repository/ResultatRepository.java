package com.autoecole.backend.repository;

import com.autoecole.backend.entity.ResultatExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultatRepository extends JpaRepository<ResultatExamen, Long> {
    List<ResultatExamen> findByEleveId(Long eleveId);
}