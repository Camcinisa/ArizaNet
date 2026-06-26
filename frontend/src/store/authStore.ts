import { create } from "zustand";
import { STORAGE_KEYS } from "../lib/constants";
import { removeAccessToken, setAccessToken } from "../lib/token";
import type { AuthUser, LoginResponse } from "../features/auth/types/auth.types";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setLogin: (response: LoginResponse) => void;
    logout: () => void;
}

function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
    }
}

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
    user: initialUser,
    isAuthenticated: Boolean(initialUser),

    setLogin: (response) => {
        const user: AuthUser = {
            fullName: response.fullName,
            role: response.role,
        };

        setAccessToken(response.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({
            user,
            isAuthenticated: true,
        });
    },

    logout: () => {
        removeAccessToken();
        localStorage.removeItem(STORAGE_KEYS.USER);

        set({
            user: null,
            isAuthenticated: false,
        });
    },
}));
