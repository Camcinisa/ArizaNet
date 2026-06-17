package com.arizanet.auth.repository;

import com.arizanet.auth.entity.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {

    Optional<DeviceModel> findByModelName(String modelName);
}