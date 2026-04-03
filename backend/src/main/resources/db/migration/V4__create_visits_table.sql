
CREATE TABLE app.visits (
    id BIGSERIAL PRIMARY KEY,
    chew_user_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    visit_time TIMESTAMP NOT NULL,
    chief_complaint VARCHAR(1000) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    risk_level VARCHAR(50),
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_visit_chew
        FOREIGN KEY (chew_user_id)
        REFERENCES app.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_visit_patient
        FOREIGN KEY (patient_id)
        REFERENCES app.patients(id)
        ON DELETE CASCADE
);