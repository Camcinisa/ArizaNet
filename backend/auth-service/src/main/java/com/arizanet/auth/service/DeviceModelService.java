package com.arizanet.auth.service;
import com.arizanet.auth.dto.response.DeviceModelResponse;
import com.arizanet.auth.entity.DeviceModel;
import com.arizanet.auth.repository.DeviceModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;
@Service
@RequiredArgsConstructor
public class DeviceModelService {
    private final DeviceModelRepository deviceModelRepository;
    public List<DeviceModelResponse> getAllDeviceModels() {
        return deviceModelRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    private DeviceModelResponse mapToResponse(DeviceModel deviceModel) {
        return DeviceModelResponse.builder()
                .id(deviceModel.getId())
                .modelName(deviceModel.getModelName())
                .description(deviceModel.getDescription())
                .build();
    }
}