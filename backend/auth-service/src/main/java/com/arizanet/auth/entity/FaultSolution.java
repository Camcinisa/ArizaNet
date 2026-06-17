package com.arizanet.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fault_solutions")
public class FaultSolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_model_id", nullable = false)
    private DeviceModel deviceModel;
    @Column(name = "error_code", nullable = false, length = 50)
    private String errorCode;
    @Column(name = "title", nullable = false, length = 150)
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
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}