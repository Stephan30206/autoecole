package com.autoecole.backend.config;

import com.autoecole.backend.entity.AuthAccount;
import com.autoecole.backend.repository.AuthAccountRepository;
import com.autoecole.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final AuthAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminBootstrap(AuthAccountRepository accounts, PasswordEncoder passwordEncoder,
                          @Value("${autoecole.admin.email:}") String email,
                          @Value("${autoecole.admin.password:}") String password) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) return;
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("ADMIN_EMAIL and ADMIN_PASSWORD must be configured together");
        }
        if (password.length() < 12 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("ADMIN_PASSWORD must contain at least 12 characters and at most 72 UTF-8 bytes");
        }
        String normalizedEmail = AuthService.normalizeEmail(email);
        if (accounts.findByEmail(normalizedEmail).isPresent()) return;

        AuthAccount admin = new AuthAccount();
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        admin.setVerified(true);
        accounts.save(admin);
    }
}
