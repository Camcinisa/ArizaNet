package com.arizanet.faultservice.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class UpdateFaultSolutionRequest {
    @NotNull(message = "Cihaz modeli id boş olamaz.")
    private Long deviceModelId;
    @NotBlank(message = "Hata kodu boş olamaz.")
    private String errorCode;
    @NotBlank(message = "Hata başlığı boş olamaz.")
    private String title;
    @NotBlank(message = "Hata açıklaması boş olamaz.")
    private String description;
    @NotBlank(message = "Olası nedenler boş olamaz.")
    private String possibleCauses;
    @NotBlank(message = "Çözüm adımları boş olamaz.")
    private String solutionSteps;
    private String requiredTools;
    private String warnings;
}
