export type UserRole = "Admin" | "User";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    fullName: string;
    role: UserRole;
}

export interface AuthUser {
    username: string;
    fullName: string;
    role: UserRole;
}
