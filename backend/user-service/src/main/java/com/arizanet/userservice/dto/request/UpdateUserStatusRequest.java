package com.arizanet.userservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "Aktiflik durumu boş olamaz.")
    private Boolean active;
}