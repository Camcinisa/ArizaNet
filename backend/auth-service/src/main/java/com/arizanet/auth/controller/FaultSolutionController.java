package com.arizanet.auth.controller;
import com.arizanet.auth.dto.request.CreateFaultSolutionRequest;
import com.arizanet.auth.dto.request.UpdateFaultSolutionRequest;
import com.arizanet.auth.dto.response.FaultSolutionDetailResponse;
import com.arizanet.auth.dto.response.FaultSolutionListResponse;
import com.arizanet.auth.service.FaultSolutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/fault-solutions")
@RequiredArgsConstructor
public class FaultSolutionController {
    private final FaultSolutionService faultSolutionService;
    @GetMapping
    public List<FaultSolutionListResponse> getAllFaultSolutions() {
        return faultSolutionService.getAllFaultSolutions();
    }
    @GetMapping("/search")
    public List<FaultSolutionListResponse> searchFaultSolutions(@RequestParam String query) {
        return faultSolutionService.searchFaultSolutions(query);
    }
    @GetMapping("/{id}")
    public FaultSolutionDetailResponse getFaultSolutionById(@PathVariable Long id) {
        return faultSolutionService.getFaultSolutionById(id);
    }
    @PostMapping
    public FaultSolutionDetailResponse createFaultSolution(
            @Valid @RequestBody CreateFaultSolutionRequest request
    ) {
        return faultSolutionService.createFaultSolution(request);
    }
    @PutMapping("/{id}")
    public FaultSolutionDetailResponse updateFaultSolution(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFaultSolutionRequest request
    ) {
        return faultSolutionService.updateFaultSolution(id, request);
    }
    @DeleteMapping("/{id}")
    public void deleteFaultSolution(@PathVariable Long id) {
        faultSolutionService.deleteFaultSolution(id);
    }
}