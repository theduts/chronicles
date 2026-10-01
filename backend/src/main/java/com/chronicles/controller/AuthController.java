package com.chronicles.controller;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.auth.AuthResponse;
import com.chronicles.dto.auth.LoginRequest;
import com.chronicles.dto.auth.RegisterRequest;
import com.chronicles.repository.UserRepository;
import com.chronicles.security.JwtService;
import com.chronicles.service.LoginRateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints para registro e autenticação de usuários via JWT")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final LoginRateLimitService loginRateLimitService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário e retorna o token JWT.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        String trimmedUsername = request.username().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está em uso.");
        }

        if (userRepository.existsByUsername(trimmedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este nome de usuário já está em uso.");
        }

        User user = User.builder()
                .username(trimmedUsername)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.ROLE_USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.of(
                        token,
                        savedUser.getId(),
                        savedUser.getActualUsername(),
                        savedUser.getEmail(),
                        savedUser.getRole(),
                        savedUser.getLastViewMode()
                ));
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Autentica com e-mail/username e senha, retornando o token JWT.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String identifier = request.email().trim();

        loginRateLimitService.checkNotBlocked(ipAddress, identifier);

        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByUsername(identifier))
                .orElseGet(() -> {
                    loginRateLimitService.recordFailure(ipAddress, identifier);
                    throw new BadCredentialsException("E-mail ou senha inválidos");
                });

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.password())
            );
        } catch (BadCredentialsException ex) {
            loginRateLimitService.recordFailure(ipAddress, identifier);
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }

        loginRateLimitService.recordSuccess(ipAddress, identifier);
        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(AuthResponse.of(
                token,
                user.getId(),
                user.getActualUsername(),
                user.getEmail(),
                user.getRole(),
                user.getLastViewMode()
        ));
    }
}
