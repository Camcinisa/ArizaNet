package com.arizanet.auth.repository;

import com.arizanet.auth.entity.FaultSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FaultSolutionRepository extends JpaRepository<FaultSolution, Long> {

    @Query("SELECT f FROM FaultSolution f " +
            "JOIN f.deviceModel d " +
            "WHERE LOWER(f.errorCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(f.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(d.modelName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<FaultSolution> searchFaultSolutions(@Param("query") String query);
}