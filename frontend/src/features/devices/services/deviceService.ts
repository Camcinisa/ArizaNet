import { apiClient } from "../../../lib/axios";
import type {
    CreateDeviceModelRequest,
    DeviceModel,
    UpdateDeviceModelRequest,
} from "../types/device.types";

export async function getDeviceModels(): Promise<DeviceModel[]> {
    const response = await apiClient.get<DeviceModel[]>("/api/device-models");
    return response.data;
}

export async function getActiveDeviceModels(): Promise<DeviceModel[]> {
    const response = await apiClient.get<DeviceModel[]>("/api/device-models/active");
    return response.data;
}

export async function createDeviceModel(
    request: CreateDeviceModelRequest
): Promise<DeviceModel> {
    const response = await apiClient.post<DeviceModel>(
        "/api/device-models",
        request
    );

    return response.data;
}

export async function updateDeviceModel(
    id: number,
    request: UpdateDeviceModelRequest
): Promise<DeviceModel> {
    const response = await apiClient.put<DeviceModel>(
        `/api/device-models/${id}`,
        request
    );

    return response.data;
}

export async function deactivateDeviceModel(id: number): Promise<DeviceModel> {
    const response = await apiClient.delete<DeviceModel>(
        `/api/device-models/${id}`
    );

    return response.data;
}

export async function activateDeviceModel(id: number): Promise<DeviceModel> {
    const response = await apiClient.patch<DeviceModel>(
        `/api/device-models/${id}/activate`
    );

    return response.data;
}