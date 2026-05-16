import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { parseJwt } from "../utils/jwt";

interface ProtectedRouteProps {
    element: JSX.Element;
    allowedRoles: string[];
}

export default function ProtectedRoute({ element, allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const payload = parseJwt(token);
        if (!payload) {
            return <Navigate to="/" replace />;
        }

        const roles: string[] = payload.roles || payload.authorities || payload.scope || [];

        const hasAccess = roles.some((r) => allowedRoles.includes(r));
        return hasAccess ? element : <Navigate to="/" replace />;
    } catch {
        return <Navigate to="/" replace />;
    }
}
