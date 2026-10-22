CREATE TABLE auth_account (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    account_role VARCHAR(16) NOT NULL CHECK (account_role IN ('ADMIN', 'ELEVE')),
    id_eleve BIGINT UNIQUE REFERENCES eleve(id_eleve),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT auth_account_role_student_link CHECK (
        (account_role = 'ELEVE' AND id_eleve IS NOT NULL) OR (account_role = 'ADMIN' AND id_eleve IS NULL)
    )
);

CREATE TABLE email_verification_token (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE REFERENCES auth_account(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_email_verification_token_expires ON email_verification_token(expires_at);

CREATE TABLE auth_session (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES auth_account(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_session_account ON auth_session(account_id);
CREATE INDEX idx_auth_session_expires ON auth_session(expires_at);
