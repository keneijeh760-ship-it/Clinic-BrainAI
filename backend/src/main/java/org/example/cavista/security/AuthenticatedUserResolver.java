package org.example.cavista.security;

import lombok.RequiredArgsConstructor;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.exception.InvalidChewRoleException;
import org.example.cavista.exception.UserNotFoundException;
import org.example.cavista.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resolves the currently authenticated {@link UserEntity} from the Spring Security
 * context. The JWT filter puts the {@link UserEntity} itself in as the principal,
 * so we cast or re-fetch defensively.
 */
@Component
@RequiredArgsConstructor
public class AuthenticatedUserResolver {

    private final UserRepository userRepository;

    public UserEntity current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new UserNotFoundException("No authenticated user");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserEntity ue) {
            return ue;
        }
        String username = auth.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    public UserEntity currentWithRole(UserRole required) {
        UserEntity user = current();
        if (user.getRole() != required) {
            throw new InvalidChewRoleException(
                    "User " + user.getEmail() + " does not have required role " + required
            );
        }
        return user;
    }
}
