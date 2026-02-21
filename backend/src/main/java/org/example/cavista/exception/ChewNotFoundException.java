package org.example.cavista.exception;

public class ChewNotFoundException extends RuntimeException {

    public ChewNotFoundException(Long chewId) {
        super("CHEW not found: " + chewId);
    }
}
