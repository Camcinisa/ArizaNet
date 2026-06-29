import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import FaultSearchPage from "../features/fault/pages/FaultSearchPage";
import ProtectedRoute from "./ProtectedRoute";

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
        ],
    },
]);