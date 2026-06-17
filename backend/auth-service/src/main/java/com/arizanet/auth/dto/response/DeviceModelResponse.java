package com.arizanet.auth.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@Builder
public class DeviceModelResponse {
    private Long id;
    private String modelName;
    private String description;
}

