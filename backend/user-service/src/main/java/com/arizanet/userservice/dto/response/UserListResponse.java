package com.arizanet.userservice.dto.response;

public record UserListResponse(
        Long id,
        String fullName,
        String username,
        String email,
        String phone,
        String role,
        boolean active,
        String status
) {
}