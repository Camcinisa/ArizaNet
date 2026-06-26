export const APP_NAME = "ArızaNet";

export const ROUTES = {
    LOGIN: "/login",
    HOME: "/",
    DASHBOARD: "/app",
    FAULT_SEARCH: "/app/fault-search",
} as const;

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "arizanet_access_token",
    USER: "arizanet_user",
} as const;

export const USER_ROLES = {
    ADMIN: "Admin",
    USER: "User",
} as const;