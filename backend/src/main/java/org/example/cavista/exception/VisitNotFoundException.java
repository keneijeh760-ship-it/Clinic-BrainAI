package org.example.cavista.exception;

public class VisitNotFoundException extends RuntimeException {

    public VisitNotFoundException(Long visitId) {
        super("Visit not found: " + visitId);
    }
}
