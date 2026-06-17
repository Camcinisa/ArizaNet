package com.arizanet.auth.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UpdateFaultSolutionRequest {
    @NotNull(message = "Cihaz modeli seçilmelidir")
    private Long deviceModelId;
    @NotBlank(message = "Hata kodu boş olamaz")
    private String errorCode;
    @NotBlank(message = "Başlık boş olamaz")
    private String title;
    private String description;
    private String possibleCauses;
    private String solutionSteps;
    private String requiredTools;
    private String warnings;
}

