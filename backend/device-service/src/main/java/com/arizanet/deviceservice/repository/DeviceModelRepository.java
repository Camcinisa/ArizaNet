package com.arizanet.deviceservice.repository;

import com.arizanet.deviceservice.entity.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {

    List<DeviceModel> findByActiveTrue();

    boolean existsByModelNameIgnoreCase(String modelName);

    boolean existsByExternalModelId(Integer externalModelId);
}