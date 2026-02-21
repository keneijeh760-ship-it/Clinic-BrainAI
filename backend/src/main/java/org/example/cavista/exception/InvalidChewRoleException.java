package org.example.cavista.exception;

public class InvalidChewRoleException extends RuntimeException {

    public InvalidChewRoleException(String message) {
        super(message);
    }

    public InvalidChewRoleException(String chewId) {
        super("User is not a CHEW: " + chewId);
    }
}
