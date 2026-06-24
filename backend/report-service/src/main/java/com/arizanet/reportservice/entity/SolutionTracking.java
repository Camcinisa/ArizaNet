package com.arizanet.reportservice.entity;

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
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "fault_solution_id")
    private Long faultSolutionId;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "device_model")
    private String deviceModel;

    @Column(name = "result_status")
    private String resultStatus;

    @Column(name = "note")
    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}