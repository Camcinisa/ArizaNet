package com.arizanet.faultservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FaultSolutionListResponse {

    private Long id;
    private Long deviceModelId;
    private String deviceModel;
    private String errorCode;
    private String title;
    private String shortDescription;
}
