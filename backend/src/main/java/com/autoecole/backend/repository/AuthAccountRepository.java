package com.autoecole.backend.repository;

import com.autoecole.backend.entity.AuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuthAccountRepository extends JpaRepository<AuthAccount, Long> {
    Optional<AuthAccount> findByEmail(String email);
}
