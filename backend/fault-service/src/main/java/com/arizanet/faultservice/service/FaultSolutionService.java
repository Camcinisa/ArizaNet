package com.arizanet.faultservice.service;

import com.arizanet.faultservice.dto.response.FaultSolutionDetailResponse;
import com.arizanet.faultservice.dto.response.FaultSolutionListResponse;
import com.arizanet.faultservice.entity.FaultSolution;
import com.arizanet.faultservice.repository.FaultSolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaultSolutionService {

    private final FaultSolutionRepository faultSolutionRepository;

    public List<FaultSolutionListResponse> getAllFaultSolutions() {
        return faultSolutionRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    public FaultSolutionDetailResponse getFaultSolutionById(Long id) {
        FaultSolution faultSolution = faultSolutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata kaydı bulunamadı. ID: " + id));

        return mapToDetailResponse(faultSolution);
    }

    public List<FaultSolutionListResponse> searchFaultSolutions(String query) {
        return faultSolutionRepository.searchFaultSolutions(query)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    private FaultSolutionListResponse mapToListResponse(FaultSolution faultSolution) {
        return new FaultSolutionListResponse(
                faultSolution.getId(),
                faultSolution.getDeviceModel().getModelName(),
                faultSolution.getErrorCode(),
                faultSolution.getTitle(),
                faultSolution.getDescription()
        );
    }

    private FaultSolutionDetailResponse mapToDetailResponse(FaultSolution faultSolution) {
        return new FaultSolutionDetailResponse(
                faultSolution.getId(),
                faultSolution.getDeviceModel().getModelName(),
                faultSolution.getErrorCode(),
                faultSolution.getTitle(),
                faultSolution.getDescription(),
                faultSolution.getPossibleCauses(),
                faultSolution.getSolutionSteps(),
                faultSolution.getRequiredTools(),
                faultSolution.getWarnings()
        );
    }
}