import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import FaultSearchPage from "../features/fault/pages/FaultSearchPage";
import SolutionTrackingPage from "../features/solutionTracking/pages/SolutionTrackingPage";
import DeviceManagementPage from "../features/devices/pages/DeviceManagementPage";
import UserManagementPage from "../features/users/pages/UserManagementPage";
import ProfilePage from "../features/users/pages/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";

function AdminOnlyPage({ page }: { page: "devices" | "users" }) {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "Admin") {
        return <Navigate to="/faults" replace />;
    }

    return page === "devices" ? <DeviceManagementPage /> : <UserManagementPage />;
}

function UserProfilePage() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "Admin") {
        return <Navigate to="/faults" replace />;
    }

    return <ProfilePage />;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/faults",
                element: <FaultSearchPage />,
            },
            {
                path: "/solution-trackings",
                element: <SolutionTrackingPage />,
            },
            {
                path: "/profile",
                element: <UserProfilePage />,
            },
            {
                path: "/devices",
                element: <AdminOnlyPage page="devices" />,
            },
            {
                path: "/users",
                element: <AdminOnlyPage page="users" />,
            },
        ],
    },
]);
