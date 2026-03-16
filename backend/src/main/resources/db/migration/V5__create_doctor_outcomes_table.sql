CREATE TABLE app.doctor_outcomes (
    id BIGSERIAL PRIMARY KEY,

    visit_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,

    decision VARCHAR(255) NOT NULL,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_outcome_visit
        FOREIGN KEY (visit_id)
        REFERENCES app.visits(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_outcome_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES app.users(id)
        ON DELETE CASCADE
);