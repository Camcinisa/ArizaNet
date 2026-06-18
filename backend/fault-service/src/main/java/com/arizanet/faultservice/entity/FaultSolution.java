package com.arizanet.faultservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "fault_solutions")
public class FaultSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_model_id", nullable = false)
    private DeviceModel deviceModel;

    @Column(name = "error_code", nullable = false)
    private String errorCode;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "possible_causes", columnDefinition = "NVARCHAR(MAX)")
    private String possibleCauses;

    @Column(name = "solution_steps", columnDefinition = "NVARCHAR(MAX)")
    private String solutionSteps;

    @Column(name = "required_tools", columnDefinition = "NVARCHAR(MAX)")
    private String requiredTools;

    @Column(name = "warnings", columnDefinition = "NVARCHAR(MAX)")
    private String warnings;
}