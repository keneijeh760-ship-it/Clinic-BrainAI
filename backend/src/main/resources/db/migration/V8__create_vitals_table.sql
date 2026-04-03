CREATE TABLE app.vitals (
    id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT NOT NULL UNIQUE,

    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    temperature DOUBLE PRECISION,
    pulse INT,
    respiratory_rate INT,
    oxygen_saturation DOUBLE PRECISION,

    CONSTRAINT fk_vitals_visit
        FOREIGN KEY (visit_id)
        REFERENCES app.visits(id)
        ON DELETE CASCADE
);