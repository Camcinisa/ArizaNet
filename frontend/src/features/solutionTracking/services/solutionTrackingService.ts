import { apiClient } from "../../../lib/axios";
import type {
    CreateSolutionTrackingRequest,
    SolutionTracking,
} from "../types/solutionTracking.types";

export async function getSolutionTrackings(): Promise<SolutionTracking[]> {
    const response = await apiClient.get<SolutionTracking[]>(
        "/api/solution-tracking"
    );

    return response.data;
}

export async function getSolutionTrackingsByUsername(username: string): Promise<SolutionTracking[]> {
    const response = await apiClient.get<SolutionTracking[]>(
        `/api/solution-tracking/username/${encodeURIComponent(username)}`
    );

    return response.data;
}

export async function getMySolutionTrackings(username: string): Promise<SolutionTracking[]> {
    return getSolutionTrackingsByUsername(username);
}

export async function createSolutionTracking(
    request: CreateSolutionTrackingRequest
): Promise<SolutionTracking> {
    const response = await apiClient.post<SolutionTracking>(
        "/api/solution-tracking",
        request
    );

    return response.data;
}
