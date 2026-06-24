package com.arizanet.reportservice.controller;

import com.arizanet.reportservice.dto.response.ReportItemResponse;
import com.arizanet.reportservice.dto.response.ReportSummaryResponse;
import com.arizanet.reportservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ReportSummaryResponse getSummary() {
        return reportService.getSummary();
    }

    @GetMapping("/most-used-error-codes")
    public List<ReportItemResponse> getMostUsedErrorCodes() {
        return reportService.getMostUsedErrorCodes();
    }

    @GetMapping("/most-used-device-models")
    public List<ReportItemResponse> getMostUsedDeviceModels() {
        return reportService.getMostUsedDeviceModels();
    }

    @GetMapping("/user-activity")
    public List<ReportItemResponse> getUserActivity() {
        return reportService.getUserActivity();
    }
}