package com.arizanet.auth.controller;

import com.arizanet.auth.dto.response.DeviceModelResponse;
import com.arizanet.auth.service.DeviceModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device-models")
@RequiredArgsConstructor
public class DeviceModelController {

    private final DeviceModelService deviceModelService;

    @GetMapping
    public List<DeviceModelResponse> getAllDeviceModels() {
        return deviceModelService.getAllDeviceModels();
    }
}