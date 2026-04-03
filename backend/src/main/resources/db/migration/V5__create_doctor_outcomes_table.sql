CREATE SEQUENCE IF NOT EXISTS outcome_id START 1 INCREMENT 1;

CREATE TABLE app.doctor_outcomes (
    id BIGINT NOT NULL DEFAULT nextval('outcome_id'),
    visit_id BIGINT NOT NULL UNIQUE,
    doctor_user_id BIGINT NOT NULL,
    decision VARCHAR(255) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP NOT NULL,

    CONSTRAINT pk_doctor_outcomes PRIMARY KEY (id),

    CONSTRAINT fk_outcome_visit
        FOREIGN KEY (visit_id)
        REFERENCES app.visits(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_outcome_doctor
        FOREIGN KEY (doctor_user_id)
        REFERENCES app.users(id)
        ON DELETE CASCADE
);