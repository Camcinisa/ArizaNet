export type DeviceModel = {
    id: number;
    externalModelId?: number | null;
    modelName: string;
    description?: string | null;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateDeviceModelRequest = {
    externalModelId?: number | null;
    modelName: string;
    description?: string | null;
};

export type UpdateDeviceModelRequest = {
    externalModelId?: number | null;
    modelName: string;
    description?: string | null;
};