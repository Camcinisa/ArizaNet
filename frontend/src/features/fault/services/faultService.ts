import { apiClient } from "../../../lib/axios";
import type { FaultSolution } from "../types/fault.types";

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