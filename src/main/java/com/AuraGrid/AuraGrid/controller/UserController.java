package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.UserRegistrationRequest;
import com.AuraGrid.AuraGrid.dto.UserResponse;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody UserRegistrationRequest request) {

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .build();
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .build();
        }

        // Create User entity
        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Hash the plain-text password
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // createdAt is handled by @PrePersist
        User savedUser = userRepository.save(user);

        // Never return the password/hash to the client
        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}