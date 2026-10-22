package com.autoecole.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "auth_account")
@Getter @Setter @NoArgsConstructor
public class AuthAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "account_role", nullable = false, length = 16)
    private String role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_eleve", unique = true)
    private Eleve eleve;

    @Column(nullable = false)
    private boolean verified;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
