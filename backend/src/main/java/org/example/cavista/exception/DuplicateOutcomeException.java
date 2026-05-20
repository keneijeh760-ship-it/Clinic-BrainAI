package org.example.cavista.exception;

public class DuplicateOutcomeException extends RuntimeException {
    public DuplicateOutcomeException(Long visitId) {
        super("An outcome has already been recorded for visit " + visitId);
    }
}
