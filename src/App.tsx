import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
    useEffect(() => {
        const sendHeartbeat = async () => {
            const token = localStorage.getItem("accessToken");
            const role = localStorage.getItem("role");

            if (!token) return;
            if (role !== "MODERATOR" && role !== "ROLE_MODERATOR") return;

            try {
                await fetch("http://localhost:8182/api/v1/analytics/logs/monitoring/heartbeat", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.error("Критическая ошибка отправки пульса сессии модератора:", err);
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 5000);

        return () => clearInterval(interval);
    }, []);

    return <RouterProvider router={router} />;
}
