import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function parseJwt(token: string) {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export default function App() {
    useEffect(() => {
        const sendHeartbeat = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const decoded = parseJwt(token);
            if (!decoded) return;

            const userRole = decoded.role || decoded.roles || decoded.authorities || "";
            const roleString = Array.isArray(userRole) ? userRole.join(",") : String(userRole);
            const normalizedRole = roleString.toUpperCase();

            const isChild = normalizedRole.includes("CHILD");
            const isModerator = normalizedRole.includes("MODERATOR");

            if (!isChild && !isModerator) return;

            try {
                if (isChild) {
                    const birthDate = decoded.birthDate || "2015-01-01";
                    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();

                    const res = await fetch(
                        `http://localhost:8182/api/v1/analytics/logs/monitoring/heartbeat/child?age=${age}`,
                        {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === "BLOCKED") {
                            alert(data.message);
                            localStorage.clear();
                            window.location.replace("/");
                        }
                    }
                } else if (isModerator) {
                    await fetch("http://localhost:8182/api/v1/analytics/logs/monitoring/heartbeat", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (err) {
                console.error("Критическая ошибка отправки пульса сессии:", err);
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 10000);

        return () => clearInterval(interval);
    }, []);

    return <RouterProvider router={router} />;
}
