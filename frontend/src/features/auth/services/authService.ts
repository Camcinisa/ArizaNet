import { apiClient } from "../../../lib/axios";
import type { LoginRequest, LoginResponse } from "../types/auth.types";

export async function login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", request);
    return response.data;
}