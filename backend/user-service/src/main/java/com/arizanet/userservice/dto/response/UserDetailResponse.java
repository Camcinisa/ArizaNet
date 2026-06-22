package com.arizanet.userservice.dto.response;

import java.time.LocalDateTime;

public record UserDetailResponse(
        Long id,
        String fullName,
        String username,
        String email,
        String phone,
        String role,
        boolean active,
        String status,
        LocalDateTime createdAt
) {
}