package com.arizanet.reportservice.service;

import com.arizanet.reportservice.dto.response.ReportItemResponse;
import com.arizanet.reportservice.dto.response.ReportSummaryResponse;
import com.arizanet.reportservice.repository.SolutionTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SolutionTrackingRepository solutionTrackingRepository;

    public ReportSummaryResponse getSummary() {
        long totalTrackingCount = solutionTrackingRepository.count();
        long successCount = solutionTrackingRepository.countByResultStatus("SUCCESS");
        long failedCount = solutionTrackingRepository.countByResultStatus("FAILED");

        return new ReportSummaryResponse(
                totalTrackingCount,
                successCount,
                failedCount
        );
    }

    public List<ReportItemResponse> getMostUsedErrorCodes() {
        return solutionTrackingRepository.findMostUsedErrorCodes()
                .stream()
                .map(row -> new ReportItemResponse(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    public List<ReportItemResponse> getMostUsedDeviceModels() {
        return solutionTrackingRepository.findMostUsedDeviceModels()
                .stream()
                .map(row -> new ReportItemResponse(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    public List<ReportItemResponse> getUserActivity() {
        return solutionTrackingRepository.findUserActivity()
                .stream()
                .map(row -> new ReportItemResponse(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }
}