package com.arizanet.solutiontrackingservice.controller;

import com.arizanet.solutiontrackingservice.dto.request.CreateSolutionTrackingRequest;
import com.arizanet.solutiontrackingservice.dto.response.SolutionTrackingResponse;
import com.arizanet.solutiontrackingservice.service.SolutionTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/solution-tracking")
@RequiredArgsConstructor
public class SolutionTrackingController {

    private final SolutionTrackingService solutionTrackingService;

    @GetMapping
    public List<SolutionTrackingResponse> getAllTrackingRecords() {
        return solutionTrackingService.getAllTrackingRecords();
    }

    @GetMapping("/{id}")
    public SolutionTrackingResponse getTrackingRecordById(@PathVariable Long id) {
        return solutionTrackingService.getTrackingRecordById(id);
    }

    @GetMapping("/user/{userId}")
    public List<SolutionTrackingResponse> getTrackingRecordsByUserId(@PathVariable Long userId) {
        return solutionTrackingService.getTrackingRecordsByUserId(userId);
    }

    @GetMapping("/username/{username}")
    public List<SolutionTrackingResponse> getTrackingRecordsByUsername(@PathVariable String username) {
        return solutionTrackingService.getTrackingRecordsByUsername(username);
    }

    @GetMapping("/fault-solution/{faultSolutionId}")
    public List<SolutionTrackingResponse> getTrackingRecordsByFaultSolutionId(@PathVariable Long faultSolutionId) {
        return solutionTrackingService.getTrackingRecordsByFaultSolutionId(faultSolutionId);
    }

    @GetMapping("/status/{resultStatus}")
    public List<SolutionTrackingResponse> getTrackingRecordsByResultStatus(@PathVariable String resultStatus) {
        return solutionTrackingService.getTrackingRecordsByResultStatus(resultStatus);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolutionTrackingResponse createTrackingRecord(
            @Valid @RequestBody CreateSolutionTrackingRequest request,
            Principal principal) {
        return solutionTrackingService.createTrackingRecord(request, principal.getName());
    }
}