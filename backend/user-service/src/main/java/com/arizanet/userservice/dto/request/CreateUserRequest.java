package com.arizanet.userservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Ad soyad boş olamaz.")
    private String fullName;

    @NotBlank(message = "Kullanıcı adı boş olamaz.")
    private String username;

    @NotBlank(message = "Şifre boş olamaz.")
    private String password;

    @Email(message = "Geçerli bir e-posta adresi giriniz.")
    private String email;

    private String phone;

    @NotBlank(message = "Rol boş olamaz.")
    private String role;

    private String status;
}