package com.arizanet.faultservice.service;

import com.arizanet.faultservice.dto.request.CreateFaultSolutionRequest;
import com.arizanet.faultservice.dto.request.UpdateFaultSolutionRequest;
import com.arizanet.faultservice.dto.response.FaultSolutionDetailResponse;
import com.arizanet.faultservice.dto.response.FaultSolutionListResponse;
import com.arizanet.faultservice.entity.DeviceModel;
import com.arizanet.faultservice.entity.FaultSolution;
import com.arizanet.faultservice.repository.DeviceModelRepository;
import com.arizanet.faultservice.repository.FaultSolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public FaultSolutionDetailResponse createFaultSolution(CreateFaultSolutionRequest request) {
        DeviceModel deviceModel = deviceModelRepository.findById(request.getDeviceModelId())
                .orElseThrow(() -> new RuntimeException("Cihaz modeli bulunamadı. ID: " + request.getDeviceModelId()));

        FaultSolution faultSolution = new FaultSolution();
        faultSolution.setDeviceModel(deviceModel);
        faultSolution.setErrorCode(request.getErrorCode());
        faultSolution.setTitle(request.getTitle());
        faultSolution.setDescription(request.getDescription());
        faultSolution.setPossibleCauses(request.getPossibleCauses());
        faultSolution.setSolutionSteps(request.getSolutionSteps());
        faultSolution.setRequiredTools(request.getRequiredTools());
        faultSolution.setWarnings(request.getWarnings());

        FaultSolution savedFaultSolution = faultSolutionRepository.save(faultSolution);

        return mapToDetailResponse(savedFaultSolution);
    }

    public FaultSolutionDetailResponse updateFaultSolution(Long id, UpdateFaultSolutionRequest request) {
        FaultSolution faultSolution = faultSolutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata kaydı bulunamadı. ID: " + id));

        DeviceModel deviceModel = deviceModelRepository.findById(request.getDeviceModelId())
                .orElseThrow(() -> new RuntimeException("Cihaz modeli bulunamadı. ID: " + request.getDeviceModelId()));

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
        FaultSolution faultSolution = faultSolutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata kaydı bulunamadı. ID: " + id));

        faultSolutionRepository.delete(faultSolution);
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