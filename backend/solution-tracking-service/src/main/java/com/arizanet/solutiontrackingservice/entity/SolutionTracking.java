package com.arizanet.solutiontrackingservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "solution_tracking")
@Getter
@Setter
public class SolutionTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "fault_solution_id", nullable = false)
    private Long faultSolutionId;

    @Column(name = "error_code", nullable = false, length = 50)
    private String errorCode;

    @Column(name = "device_model", nullable = false, length = 100)
    private String deviceModel;

    @Column(name = "result_status", nullable = false, length = 20)
    private String resultStatus;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}