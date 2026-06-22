package com.arizanet.userservice.controller;

import com.arizanet.userservice.dto.request.CreateUserRequest;
import com.arizanet.userservice.dto.request.UpdateUserStatusRequest;
import com.arizanet.userservice.dto.response.UserDetailResponse;
import com.arizanet.userservice.dto.response.UserListResponse;
import com.arizanet.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserListResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserDetailResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/me")
    public UserDetailResponse getMyProfile(Principal principal) {
        return userService.getMyProfile(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDetailResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PatchMapping("/{id}/status")
    public UserDetailResponse updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return userService.updateUserStatus(id, request);
    }
}