package com.arizanet.faultservice.controller;

import com.arizanet.faultservice.dto.response.FaultSolutionDetailResponse;
import com.arizanet.faultservice.dto.response.FaultSolutionListResponse;
import com.arizanet.faultservice.service.FaultSolutionService;
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

    @GetMapping("/{id}")
    public FaultSolutionDetailResponse getFaultSolutionById(@PathVariable Long id) {
        return faultSolutionService.getFaultSolutionById(id);
    }

    @GetMapping("/search")
    public List<FaultSolutionListResponse> searchFaultSolutions(@RequestParam String query) {
        return faultSolutionService.searchFaultSolutions(query);
    }
}