package com.arizanet.solutiontrackingservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSolutionTrackingRequest {

    @NotNull(message = "Hata çözüm id boş olamaz.")
    private Long faultSolutionId;

    @NotBlank(message = "Hata kodu boş olamaz.")
    @Size(max = 50, message = "Hata kodu en fazla 50 karakter olabilir.")
    private String errorCode;

    @NotBlank(message = "Cihaz modeli boş olamaz.")
    @Size(max = 100, message = "Cihaz modeli en fazla 100 karakter olabilir.")
    private String deviceModel;

    @NotBlank(message = "Sonuç durumu boş olamaz.")
    @Size(max = 20, message = "Sonuç durumu en fazla 20 karakter olabilir.")
    private String resultStatus;

    @Size(max = 500, message = "Not en fazla 500 karakter olabilir.")
    private String note;
}