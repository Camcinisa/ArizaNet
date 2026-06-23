package com.arizanet.auth.service;

import com.arizanet.auth.dto.request.LoginRequest;
import com.arizanet.auth.dto.response.LoginResponse;
import com.arizanet.auth.entity.User;
import com.arizanet.auth.repository.UserRepository;
import com.arizanet.auth.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private static final Set<Long> ADMIN_USER_IDS = Set.of(
            26L, 68L, 1L, 113L, 104L, 4L, 61L
    );

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!user.isActive()) {
            throw new RuntimeException("Kullanıcı hesabı pasif durumda.");
        }

        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Şifre hatalı");
        }

        String role = ADMIN_USER_IDS.contains(user.getId())
                ? "Admin"
                : "User";

        String token = jwtService.generateToken(user.getUsername(), role);

        return new LoginResponse(
                token,
                user.getFullName(),
                role
        );
    }
}