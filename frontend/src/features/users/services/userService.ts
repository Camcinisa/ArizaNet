import { apiClient } from "../../../lib/axios";
import type {
    CreateUserRequest,
    UpdateUserContactRequest,
    UpdateUserStatusRequest,
    UserDetail,
    UserListItem,
} from "../types/user.types";

export async function getUsers(): Promise<UserListItem[]> {
    const response = await apiClient.get<UserListItem[]>("/api/users");
    return response.data;
}

export async function getUserById(id: number): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>(`/api/users/${id}`);
    return response.data;
}

export async function getMyProfile(): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>("/api/users/me");
    return response.data;
}

export async function createUser(
    request: CreateUserRequest
): Promise<UserDetail> {
    const response = await apiClient.post<UserDetail>("/api/users", request);
    return response.data;
}

export async function updateUserStatus(
    id: number,
    request: UpdateUserStatusRequest
): Promise<UserDetail> {
    const response = await apiClient.patch<UserDetail>(
        `/api/users/${id}/status`,
        request
    );

    return response.data;
}

export async function updateUserContact(
    id: number,
    request: UpdateUserContactRequest
): Promise<UserDetail> {
    const response = await apiClient.patch<UserDetail>(
        `/api/users/${id}/contact`,
        request
    );

    return response.data;
}
