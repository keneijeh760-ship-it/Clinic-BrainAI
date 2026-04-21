CREATE TABLE app.chew_points (
    id BIGSERIAL PRIMARY KEY,
    chew_user_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INT NOT NULL DEFAULT 0,
    total_patients_captured INT NOT NULL DEFAULT 0
);
