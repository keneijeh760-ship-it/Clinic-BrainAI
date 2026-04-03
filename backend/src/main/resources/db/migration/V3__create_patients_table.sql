<<<<<<< HEAD:backend/src/main/resources/db/migration/V3__create_patients_table.sql
=======

>>>>>>> 76b5e42 (data seder change):src/main/resources/db/migration/V3__create_patients_table.sql
CREATE TABLE app.patients (
    id BIGSERIAL PRIMARY KEY,
    patient_identifier VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone_number VARCHAR(50),
<<<<<<< HEAD:backend/src/main/resources/db/migration/V3__create_patients_table.sql
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
=======
    address VARCHAR(255),
    payment_options VARCHAR(255),
    created_by_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_created_by
        FOREIGN KEY (created_by_user_id)
        REFERENCES app.users(id)
        ON DELETE SET NULL
>>>>>>> 76b5e42 (data seder change):src/main/resources/db/migration/V3__create_patients_table.sql
);