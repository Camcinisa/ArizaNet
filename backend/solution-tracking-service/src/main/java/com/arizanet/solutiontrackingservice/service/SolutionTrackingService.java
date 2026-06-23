package com.arizanet.solutiontrackingservice.service;

import com.arizanet.solutiontrackingservice.dto.request.CreateSolutionTrackingRequest;
import com.arizanet.solutiontrackingservice.dto.response.SolutionTrackingResponse;
import com.arizanet.solutiontrackingservice.entity.SolutionTracking;
import com.arizanet.solutiontrackingservice.repository.SolutionTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SolutionTrackingService {

    private final SolutionTrackingRepository solutionTrackingRepository;

    public List<SolutionTrackingResponse> getAllTrackingRecords() {
        return solutionTrackingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SolutionTrackingResponse getTrackingRecordById(Long id) {
        SolutionTracking tracking = solutionTrackingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Çözüm takip kaydı bulunamadı. ID: " + id));

        return mapToResponse(tracking);
    }

    public List<SolutionTrackingResponse> getTrackingRecordsByUserId(Long userId) {
        return solutionTrackingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SolutionTrackingResponse> getTrackingRecordsByUsername(String username) {
        return solutionTrackingRepository.findByUsername(username)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SolutionTrackingResponse> getTrackingRecordsByFaultSolutionId(Long faultSolutionId) {
        return solutionTrackingRepository.findByFaultSolutionId(faultSolutionId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SolutionTrackingResponse> getTrackingRecordsByResultStatus(String resultStatus) {
        return solutionTrackingRepository.findByResultStatus(resultStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SolutionTrackingResponse createTrackingRecord(CreateSolutionTrackingRequest request, String username) {
        SolutionTracking tracking = new SolutionTracking();

        tracking.setUserId(0L);
        tracking.setUsername(username);
        tracking.setFaultSolutionId(request.getFaultSolutionId());
        tracking.setErrorCode(request.getErrorCode());
        tracking.setDeviceModel(request.getDeviceModel());
        tracking.setResultStatus(request.getResultStatus());
        tracking.setNote(request.getNote());

        SolutionTracking savedTracking = solutionTrackingRepository.save(tracking);

        return mapToResponse(savedTracking);
    }

    private SolutionTrackingResponse mapToResponse(SolutionTracking tracking) {
        return new SolutionTrackingResponse(
                tracking.getId(),
                tracking.getUserId(),
                tracking.getUsername(),
                tracking.getFaultSolutionId(),
                tracking.getErrorCode(),
                tracking.getDeviceModel(),
                tracking.getResultStatus(),
                tracking.getNote(),
                tracking.getCreatedAt()
        );
    }
}