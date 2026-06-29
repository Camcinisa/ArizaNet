import { Navigate, Outlet } from "react-router-dom";
import { hasAccessToken } from "../lib/token";

function ProtectedRoute() {
    if (!hasAccessToken()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;