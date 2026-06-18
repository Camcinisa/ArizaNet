package com.arizanet.faultservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
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
}