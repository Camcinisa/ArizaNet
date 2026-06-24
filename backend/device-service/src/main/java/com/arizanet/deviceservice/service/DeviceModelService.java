package com.arizanet.deviceservice.service;

import com.arizanet.deviceservice.dto.request.DeviceModelRequest;
import com.arizanet.deviceservice.dto.response.DeviceModelResponse;
import com.arizanet.deviceservice.entity.DeviceModel;
import com.arizanet.deviceservice.repository.DeviceModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceModelService {

    private final DeviceModelRepository deviceModelRepository;

    public List<DeviceModelResponse> getAllModels() {
        return deviceModelRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DeviceModelResponse> getActiveModels() {
        return deviceModelRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DeviceModelResponse getModelById(Long id) {
        DeviceModel deviceModel = deviceModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model bulunamadı"));

        return mapToResponse(deviceModel);
    }

    public DeviceModelResponse createModel(DeviceModelRequest request) {
        if (deviceModelRepository.existsByModelNameIgnoreCase(request.getModelName())) {
            throw new RuntimeException("Bu model adı zaten kayıtlı");
        }

        if (request.getExternalModelId() != null &&
                deviceModelRepository.existsByExternalModelId(request.getExternalModelId())) {
            throw new RuntimeException("Bu external model id zaten kayıtlı");
        }

        DeviceModel deviceModel = new DeviceModel();
        deviceModel.setExternalModelId(request.getExternalModelId());
        deviceModel.setModelName(request.getModelName());
        deviceModel.setActive(true);

        DeviceModel savedModel = deviceModelRepository.save(deviceModel);

        return mapToResponse(savedModel);
    }

    public DeviceModelResponse updateModel(Long id, DeviceModelRequest request) {
        DeviceModel deviceModel = deviceModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model bulunamadı"));

        deviceModel.setExternalModelId(request.getExternalModelId());
        deviceModel.setModelName(request.getModelName());

        DeviceModel updatedModel = deviceModelRepository.save(deviceModel);

        return mapToResponse(updatedModel);
    }

    public void passiveModel(Long id) {
        DeviceModel deviceModel = deviceModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model bulunamadı"));

        deviceModel.setActive(false);
        deviceModelRepository.save(deviceModel);
    }

    private DeviceModelResponse mapToResponse(DeviceModel deviceModel) {
        return new DeviceModelResponse(
                deviceModel.getId(),
                deviceModel.getExternalModelId(),
                deviceModel.getModelName(),
                deviceModel.getActive(),
                deviceModel.getCreatedAt()
        );
    }
}