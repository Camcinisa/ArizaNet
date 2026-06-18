package com.arizanet.faultservice.repository;

import com.arizanet.faultservice.entity.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {
}