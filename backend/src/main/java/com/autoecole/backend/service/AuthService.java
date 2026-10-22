package com.autoecole.backend.service;

import com.autoecole.backend.dto.LoginRequest;
import com.autoecole.backend.dto.LoginResponse;
import com.autoecole.backend.dto.RegisterRequest;
import com.autoecole.backend.entity.AuthAccount;
import com.autoecole.backend.entity.AuthSession;
import com.autoecole.backend.entity.Eleve;
import com.autoecole.backend.entity.EmailVerificationToken;
import com.autoecole.backend.repository.AuthAccountRepository;
import com.autoecole.backend.repository.AuthSessionRepository;
import com.autoecole.backend.repository.EleveRepository;
import com.autoecole.backend.repository.EmailVerificationTokenRepository;
import com.autoecole.backend.security.AuthPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthAccountRepository accountRepository;
    private final AuthSessionRepository sessionRepository;
    private final EmailVerificationTokenRepository verificationRepository;
    private final EleveRepository eleveRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${autoecole.mail.from}")
    private String mailFrom;
    @Value("${autoecole.verification.public-url}")
    private String verificationUrl;
    @Value("${autoecole.auth.verification-ttl-minutes:30}")
    private long verificationTtlMinutes;
    @Value("${autoecole.auth.session-ttl-days:30}")
    private long sessionTtlDays;

    @Transactional
    public void register(RegisterRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe dépasse la limite sécurisée de 72 octets");
        }
        String email = normalizeEmail(request.email());
        if (accountRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée");
        }

        Eleve eleve = new Eleve();
        eleve.setNom(request.nom().trim());
        eleve.setPrenom(request.prenom().trim());
        eleve.setTelephone(request.telephone() == null ? null : request.telephone().trim());
        eleve = eleveRepository.save(eleve);

        AuthAccount account = new AuthAccount();
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setRole("ELEVE");
        account.setEleve(eleve);
        account.setVerified(false);
        account = accountRepository.save(account);

        String rawToken = randomToken();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setAccount(account);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plus(verificationTtlMinutes, ChronoUnit.MINUTES));
        verificationRepository.save(token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(email);
        message.setSubject("Vérifiez votre adresse e-mail");
        message.setText("Confirmez votre inscription en suivant ce lien : " + verificationUrl + "?token=" + rawToken);
        mailSender.send(message);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jeton de vérification manquant");
        }
        EmailVerificationToken token = verificationRepository.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jeton invalide ou déjà utilisé"));
        if (!token.getExpiresAt().isAfter(Instant.now())) {
            verificationRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jeton de vérification expiré");
        }
        token.getAccount().setVerified(true);
        verificationRepository.delete(token);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        AuthAccount account = accountRepository.findByEmail(normalizeEmail(request.email()))
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));
        if (!account.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Adresse e-mail non vérifiée");
        }

        String rawToken = randomToken();
        AuthSession session = new AuthSession();
        session.setAccount(account);
        session.setTokenHash(hash(rawToken));
        session.setExpiresAt(Instant.now().plus(sessionTtlDays, ChronoUnit.DAYS));
        sessionRepository.save(session);
        return new LoginResponse(rawToken, account.getRole(), account.getEleve() == null ? null : account.getEleve().getId(), account.getEleve() == null ? null : account.getEleve().getNom(), account.getEleve() == null ? null : account.getEleve().getPrenom(), account.getEmail());
    }

    @Transactional
    public void logout(String rawToken) {
        if (rawToken != null && !rawToken.isBlank()) sessionRepository.deleteByTokenHash(hash(rawToken));
    }

    @Transactional(readOnly = true)
    public LoginResponse currentUser(Long accountId) {
        AuthAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide"));
        return new LoginResponse(null, account.getRole(), account.getEleve() == null ? null : account.getEleve().getId(), account.getEleve() == null ? null : account.getEleve().getNom(), account.getEleve() == null ? null : account.getEleve().getPrenom(), account.getEmail());
    }

    @Transactional(readOnly = true)
    public Optional<AuthPrincipal> authenticate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return Optional.empty();
        return sessionRepository.findByTokenHashAndExpiresAtAfter(hash(rawToken), Instant.now())
                .map(AuthSession::getAccount)
                .map(account -> new AuthPrincipal(account.getId(), account.getEmail(), account.getRole(),
                        account.getEleve() == null ? null : account.getEleve().getId()));
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String randomToken() {
        byte[] token = new byte[32];
        RANDOM.nextBytes(token);
        return HexFormat.of().formatHex(token);
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
