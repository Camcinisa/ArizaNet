package com.arizanet.solutiontrackingservice.repository;

import com.arizanet.solutiontrackingservice.entity.SolutionTracking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolutionTrackingRepository extends JpaRepository<SolutionTracking, Long> {

    List<SolutionTracking> findByUserId(Long userId);

    List<SolutionTracking> findByUsername(String username);

    List<SolutionTracking> findByFaultSolutionId(Long faultSolutionId);

    List<SolutionTracking> findByResultStatus(String resultStatus);
}