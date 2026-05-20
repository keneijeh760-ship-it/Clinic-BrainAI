-- ─────────────────────────────────────────────────────────────────────────────
-- V11: patient portal support + symptom flags + missing sequences
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Outcome sequence required by OutcomeEntity @SequenceGenerator
CREATE SEQUENCE IF NOT EXISTS app.outcome_id START WITH 1 INCREMENT BY 1;

-- 2. Link patients to portal user accounts (self-registered patients)
ALTER TABLE app.patients
    ADD COLUMN IF NOT EXISTS user_id BIGINT,
    ADD CONSTRAINT fk_patient_user
        FOREIGN KEY (user_id) REFERENCES app.users(id) ON DELETE SET NULL;

-- 3. Symptom flags captured by CHEW during visit
ALTER TABLE app.visits
    ADD COLUMN IF NOT EXISTS symptom_fever                BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_cough                BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_difficulty_breathing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_chest_pain           BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_severe_headache      BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_confusion            BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_bleeding             BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_loss_of_consciousness BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_severe_dehydration   BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS symptom_convulsions          BOOLEAN DEFAULT FALSE;

-- 4. Visit requests (patients request a CHEW home visit)
CREATE TABLE IF NOT EXISTS app.visit_requests (
    id            BIGSERIAL PRIMARY KEY,
    patient_id    BIGINT        NOT NULL,
    reason        VARCHAR(1000),
    requested_date DATE,
    status        VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    chew_user_id  BIGINT,
    notes         VARCHAR(2000),
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vr_patient FOREIGN KEY (patient_id)
        REFERENCES app.patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_vr_chew    FOREIGN KEY (chew_user_id)
        REFERENCES app.users(id)    ON DELETE SET NULL
);

CREATE SEQUENCE IF NOT EXISTS app.visit_request_id START WITH 1 INCREMENT BY 1;

-- 5. Index to quickly look up open requests by CHEW
CREATE INDEX IF NOT EXISTS idx_visit_requests_status   ON app.visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_visit_requests_patient  ON app.visit_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id        ON app.patients(user_id);
