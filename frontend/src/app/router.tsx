import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "./MainLayout";

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
        path: "/app",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: (
                    <div className="text-white">
                        ArızaNet ana uygulama ekranı
                    </div>
                ),
            },
        ],
    },
]);