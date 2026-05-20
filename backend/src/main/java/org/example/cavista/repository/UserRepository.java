package org.example.cavista.repository;

import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByChewId(String chewId);
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(UserRole role);
    Page<UserEntity> findByRoleNotOrderByNameAsc(UserRole role, Pageable pageable);
}
