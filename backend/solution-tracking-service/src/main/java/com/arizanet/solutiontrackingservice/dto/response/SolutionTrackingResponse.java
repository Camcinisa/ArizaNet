package com.arizanet.solutiontrackingservice.dto.response;

import java.time.LocalDateTime;

public record SolutionTrackingResponse(
        Long id,
        Long userId,
        String username,
        Long faultSolutionId,
        String errorCode,
        String deviceModel,
        String resultStatus,
        String note,
        LocalDateTime createdAt
) {
}