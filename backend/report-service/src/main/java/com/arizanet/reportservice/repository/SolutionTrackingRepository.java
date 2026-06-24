package com.arizanet.reportservice.repository;

import com.arizanet.reportservice.entity.SolutionTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SolutionTrackingRepository extends JpaRepository<SolutionTracking, Long> {

    long countByResultStatus(String resultStatus);

    @Query("""
            SELECT s.errorCode, COUNT(s)
            FROM SolutionTracking s
            GROUP BY s.errorCode
            ORDER BY COUNT(s) DESC
            """)
    List<Object[]> findMostUsedErrorCodes();

    @Query("""
            SELECT s.deviceModel, COUNT(s)
            FROM SolutionTracking s
            GROUP BY s.deviceModel
            ORDER BY COUNT(s) DESC
            """)
    List<Object[]> findMostUsedDeviceModels();

    @Query("""
            SELECT s.username, COUNT(s)
            FROM SolutionTracking s
            GROUP BY s.username
            ORDER BY COUNT(s) DESC
            """)
    List<Object[]> findUserActivity();
}