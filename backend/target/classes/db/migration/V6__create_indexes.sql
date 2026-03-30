CREATE INDEX idx_visit_patient
ON app.visits(patient_id);

CREATE INDEX idx_visit_chew
ON app.visits(chew_user_id);

CREATE INDEX idx_visit_time
ON app.visits(visit_time);

CREATE INDEX idx_outcome_visit
ON app.doctor_outcomes(visit_id);