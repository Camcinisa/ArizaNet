package com.arizanet.auth.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@Builder
public class FaultSolutionListResponse {
    private Long id;
    private String deviceModel;
    private String errorCode;
    private String title;
    private String shortDescription;
}