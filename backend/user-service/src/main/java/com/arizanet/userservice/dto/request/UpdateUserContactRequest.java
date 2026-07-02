package com.arizanet.userservice.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserContactRequest {

    @Email(message = "Gecerli bir e-posta adresi giriniz.")
    private String email;

    private String phone;
}
