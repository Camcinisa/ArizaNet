package com.arizanet.deviceservice.dto.response;

import java.time.LocalDateTime;

public record DeviceModelResponse(
        Long id,
        Integer externalModelId,
        String modelName,
        Boolean active,
        LocalDateTime createdAt
) {
}