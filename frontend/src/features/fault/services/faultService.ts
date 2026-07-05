import { apiClient } from "../../../lib/axios";
import type { FaultSolution, FaultSolutionPayload } from "../types/fault.types";

export const getFaultSolutions = async (): Promise<FaultSolution[]> => {
    const response = await apiClient.get<FaultSolution[]>("/api/fault-solutions");
    return response.data;
};

export const searchFaultSolutions = async (
    query: string
): Promise<FaultSolution[]> => {
    const response = await apiClient.get<FaultSolution[]>("/api/fault-solutions/search", {
        params: { query },
    });

    return response.data;
};

export const getFaultSolutionById = async (
    id: number
): Promise<FaultSolution> => {
    const response = await apiClient.get<FaultSolution>(`/api/fault-solutions/${id}`);
    return response.data;
};

export const createFaultSolution = async (
    payload: FaultSolutionPayload
): Promise<FaultSolution> => {
    const response = await apiClient.post<FaultSolution>("/api/fault-solutions", payload);
    return response.data;
};

export const updateFaultSolution = async (
    id: number,
    payload: FaultSolutionPayload
): Promise<FaultSolution> => {
    const response = await apiClient.put<FaultSolution>(`/api/fault-solutions/${id}`, payload);
    return response.data;
};

export const deleteFaultSolution = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/fault-solutions/${id}`);
};
