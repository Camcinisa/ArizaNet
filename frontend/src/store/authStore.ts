import { create } from "zustand";
import { STORAGE_KEYS } from "../lib/constants";
import { removeAccessToken, setAccessToken } from "../lib/token";
import type { AuthUser, LoginResponse } from "../features/auth/types/auth.types";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setLogin: (response: LoginResponse, username: string) => void;
    logout: () => void;
}

function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (!storedUser) {
        return null;
    }

    try {
        const user = JSON.parse(storedUser) as AuthUser;

        if (!user.username) {
            localStorage.removeItem(STORAGE_KEYS.USER);
            removeAccessToken();
            return null;
        }

        return user;
    } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
    }
}

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
    user: initialUser,
    isAuthenticated: Boolean(initialUser),

    setLogin: (response, username) => {
        const user: AuthUser = {
            username,
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
