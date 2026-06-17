package com.arizanet.auth.service;

import com.arizanet.auth.dto.request.CreateFaultSolutionRequest;
import com.arizanet.auth.dto.request.UpdateFaultSolutionRequest;
import com.arizanet.auth.dto.response.FaultSolutionDetailResponse;
import com.arizanet.auth.dto.response.FaultSolutionListResponse;
import com.arizanet.auth.entity.DeviceModel;
import com.arizanet.auth.entity.FaultSolution;
import com.arizanet.auth.repository.DeviceModelRepository;
import com.arizanet.auth.repository.FaultSolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FaultSolutionService {

    private final FaultSolutionRepository faultSolutionRepository;
    private final DeviceModelRepository deviceModelRepository;

    public List<FaultSolutionListResponse> getAllFaultSolutions() {
        return faultSolutionRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public List<FaultSolutionListResponse> searchFaultSolutions(String query) {
        return faultSolutionRepository.searchFaultSolutions(query)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public FaultSolutionDetailResponse getFaultSolutionById(Long id) {
        FaultSolution faultSolution = faultSolutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata kaydı bulunamadı"));

        return mapToDetailResponse(faultSolution);
    }

    public FaultSolutionDetailResponse createFaultSolution(CreateFaultSolutionRequest request) {
        DeviceModel deviceModel = deviceModelRepository.findById(request.getDeviceModelId())
                .orElseThrow(() -> new RuntimeException("Cihaz modeli bulunamadı"));

        FaultSolution faultSolution = FaultSolution.builder()
                .deviceModel(deviceModel)
                .errorCode(request.getErrorCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .possibleCauses(request.getPossibleCauses())
                .solutionSteps(request.getSolutionSteps())
                .requiredTools(request.getRequiredTools())
                .warnings(request.getWarnings())
                .build();

        FaultSolution savedFaultSolution = faultSolutionRepository.save(faultSolution);

        return mapToDetailResponse(savedFaultSolution);
    }

    public FaultSolutionDetailResponse updateFaultSolution(Long id, UpdateFaultSolutionRequest request) {
        FaultSolution faultSolution = faultSolutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata kaydı bulunamadı"));

        DeviceModel deviceModel = deviceModelRepository.findById(request.getDeviceModelId())
                .orElseThrow(() -> new RuntimeException("Cihaz modeli bulunamadı"));

        faultSolution.setDeviceModel(deviceModel);
        faultSolution.setErrorCode(request.getErrorCode());
        faultSolution.setTitle(request.getTitle());
        faultSolution.setDescription(request.getDescription());
        faultSolution.setPossibleCauses(request.getPossibleCauses());
        faultSolution.setSolutionSteps(request.getSolutionSteps());
        faultSolution.setRequiredTools(request.getRequiredTools());
        faultSolution.setWarnings(request.getWarnings());

        FaultSolution updatedFaultSolution = faultSolutionRepository.save(faultSolution);

        return mapToDetailResponse(updatedFaultSolution);
    }

    public void deleteFaultSolution(Long id) {
        if (!faultSolutionRepository.existsById(id)) {
            throw new RuntimeException("Hata kaydı bulunamadı");
        }

        faultSolutionRepository.deleteById(id);
    }

    private FaultSolutionListResponse mapToListResponse(FaultSolution faultSolution) {
        return FaultSolutionListResponse.builder()
                .id(faultSolution.getId())
                .deviceModel(faultSolution.getDeviceModel().getModelName())
                .errorCode(faultSolution.getErrorCode())
                .title(faultSolution.getTitle())
                .shortDescription(faultSolution.getDescription())
                .build();
    }

    private FaultSolutionDetailResponse mapToDetailResponse(FaultSolution faultSolution) {
        return FaultSolutionDetailResponse.builder()
                .id(faultSolution.getId())
                .deviceModel(faultSolution.getDeviceModel().getModelName())
                .errorCode(faultSolution.getErrorCode())
                .title(faultSolution.getTitle())
                .description(faultSolution.getDescription())
                .possibleCauses(faultSolution.getPossibleCauses())
                .solutionSteps(faultSolution.getSolutionSteps())
                .requiredTools(faultSolution.getRequiredTools())
                .warnings(faultSolution.getWarnings())
                .createdAt(faultSolution.getCreatedAt())
                .updatedAt(faultSolution.getUpdatedAt())
                .build();
    }
}