CREATE TABLE app.chew_points (
    id BIGSERIAL PRIMARY KEY,
<<<<<<< HEAD:backend/src/main/resources/db/migration/V7__create_chew_points_table.sql
    chew_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INT NOT NULL DEFAULT 0,
    total_patients_captured INT NOT NULL DEFAULT 0
=======
    chew_user_id BIGINT NOT NULL UNIQUE,
    total_points INT NOT NULL DEFAULT 0,
    total_patients_captured INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_chew_points_user
        FOREIGN KEY (chew_user_id)
        REFERENCES app.users(id)
        ON DELETE CASCADE
>>>>>>> 76b5e42 (data seder change):src/main/resources/db/migration/V7__create_chew_points_table.sql
);