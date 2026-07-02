package com.arizanet.deviceservice.controller;

import com.arizanet.deviceservice.dto.request.DeviceModelRequest;
import com.arizanet.deviceservice.dto.response.DeviceModelResponse;
import com.arizanet.deviceservice.service.DeviceModelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device-models")
@RequiredArgsConstructor
public class DeviceModelController {

    private final DeviceModelService deviceModelService;

    @GetMapping
    public List<DeviceModelResponse> getAllModels() {
        return deviceModelService.getAllModels();
    }

    @GetMapping("/active")
    public List<DeviceModelResponse> getActiveModels() {
        return deviceModelService.getActiveModels();
    }

    @GetMapping("/{id}")
    public DeviceModelResponse getModelById(@PathVariable Long id) {
        return deviceModelService.getModelById(id);
    }

    @PostMapping
    public DeviceModelResponse createModel(@Valid @RequestBody DeviceModelRequest request) {
        return deviceModelService.createModel(request);
    }

    @PutMapping("/{id}")
    public DeviceModelResponse updateModel(
            @PathVariable Long id,
            @Valid @RequestBody DeviceModelRequest request
    ) {
        return deviceModelService.updateModel(id, request);
    }

    @DeleteMapping("/{id}")
    public void passiveModel(@PathVariable Long id) {
        deviceModelService.passiveModel(id);
    }

    @PatchMapping("/{id}/activate")
    public DeviceModelResponse activateModel(@PathVariable Long id) {
        return deviceModelService.activateModel(id);
    }
}
