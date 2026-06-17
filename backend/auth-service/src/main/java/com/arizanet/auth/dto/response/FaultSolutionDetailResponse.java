package com.arizanet.auth.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@Builder
public class FaultSolutionDetailResponse {
    private Long id;
    private String deviceModel;
    private String errorCode;
    private String title;
    private String description;
    private String possibleCauses;
    private String solutionSteps;
    private String requiredTools;
    private String warnings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}