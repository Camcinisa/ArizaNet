import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import FaultSearchPage from "../features/fault/pages/FaultSearchPage";
import SolutionTrackingPage from "../features/solutionTracking/pages/SolutionTrackingPage";
import DeviceManagementPage from "../features/devices/pages/DeviceManagementPage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";

function AdminOnlyDevicePage() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "Admin") {
        return <Navigate to="/faults" replace />;
    }

    return <DeviceManagementPage />;
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
                path: "/devices",
                element: <AdminOnlyDevicePage />,
            },
        ],
    },
]);
