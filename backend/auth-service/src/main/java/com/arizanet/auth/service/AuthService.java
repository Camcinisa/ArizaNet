package com.arizanet.auth.service;

import com.arizanet.auth.dto.request.LoginRequest;
import com.arizanet.auth.dto.response.LoginResponse;
import com.arizanet.auth.entity.User;
import com.arizanet.auth.repository.UserRepository;
import com.arizanet.auth.security.JwtService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

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

        String role = normalizeRole(user.getRole());

        String token = jwtService.generateToken(user.getUsername(), role);

        return new LoginResponse(
                token,
                user.getFullName(),
                role
        );
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "User";
        }

        if ("admin".equalsIgnoreCase(role)) {
            return "Admin";
        }

        if ("teknisyen".equalsIgnoreCase(role) || "technician".equalsIgnoreCase(role)) {
            return "User";
        }

        return "User";
    }
}
