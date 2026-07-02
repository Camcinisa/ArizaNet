package com.arizanet.userservice.service;

import com.arizanet.userservice.dto.request.CreateUserRequest;
import com.arizanet.userservice.dto.request.UpdateUserContactRequest;
import com.arizanet.userservice.dto.request.UpdateUserStatusRequest;
import com.arizanet.userservice.dto.response.UserDetailResponse;
import com.arizanet.userservice.dto.response.UserListResponse;
import com.arizanet.userservice.entity.User;
import com.arizanet.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserListResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    public UserDetailResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. ID: " + id));

        return mapToDetailResponse(user);
    }

    public UserDetailResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Kullanıcı adı: " + username));

        return mapToDetailResponse(user);
    }

    public UserDetailResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Bu kullanıcı adı zaten kullanılıyor: " + request.getUsername());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPasswordHash(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);
        user.setStatus(request.getStatus());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return mapToDetailResponse(savedUser);
    }

    public UserDetailResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. ID: " + id));

        user.setActive(request.getActive());

        if (Boolean.TRUE.equals(request.getActive())) {
            user.setStatus("Aktif");
        } else {
            user.setStatus("Pasif");
        }

        User updatedUser = userRepository.save(user);

        return mapToDetailResponse(updatedUser);
    }

    public UserDetailResponse updateUserContact(Long id, UpdateUserContactRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi. ID: " + id));

        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        return mapToDetailResponse(updatedUser);
    }

    private UserListResponse mapToListResponse(User user) {
        return new UserListResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getStatus()
        );
    }

    private UserDetailResponse mapToDetailResponse(User user) {
        return new UserDetailResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
