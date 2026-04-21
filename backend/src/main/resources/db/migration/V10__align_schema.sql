-- Sequences expected by Hibernate @SequenceGenerator annotations.
-- Existing BIGSERIAL columns remain, but Hibernate uses these named sequences on insert.

CREATE SEQUENCE IF NOT EXISTS app.user_Id START WITH 1000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS app.visit_Id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS app.vitals_Id START WITH 1 INCREMENT BY 1;

-- VitalsEntity maps blood pressure columns as Double, align SQL types so
-- `ddl-auto=validate` stops complaining.
ALTER TABLE app.vitals
    ALTER COLUMN blood_pressure_systolic TYPE DOUBLE PRECISION USING blood_pressure_systolic::double precision,
    ALTER COLUMN blood_pressure_diastolic TYPE DOUBLE PRECISION USING blood_pressure_diastolic::double precision;
