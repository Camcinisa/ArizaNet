package com.arizanet.deviceservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeviceModelRequest {

    private Integer externalModelId;

    @NotBlank(message = "Model adı boş olamaz")
    private String modelName;
}