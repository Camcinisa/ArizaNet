export type UserRole = "Admin" | "User" | string;

export type UserListItem = {
    id: number;
    fullName: string;
    username: string;
    email?: string | null;
    phone?: string | null;
    role: UserRole;
    active: boolean;
    status?: string | null;
};

export type UserDetail = {
    id: number;
    fullName: string;
    username: string;
    email?: string | null;
    phone?: string | null;
    role: UserRole;
    active: boolean;
    status?: string | null;
    createdAt?: string;
};

export type CreateUserRequest = {
    fullName: string;
    username: string;
    password: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    status?: string | null;
};

export type UpdateUserStatusRequest = {
    active: boolean;
};

export type UpdateUserContactRequest = {
    email?: string | null;
    phone?: string | null;
};
