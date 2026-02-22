package org.example.cavista.repository;

import org.example.cavista.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findById(Long Id);
    Optional<UserEntity> findByEmail(String email);
}


