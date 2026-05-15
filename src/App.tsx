import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import {router} from "./router.tsx";

function App() {
    useEffect(() => {
        const sendHeartbeat = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            try {
                await fetch("http://localhost:8182/api/v1/analytics/logs/monitoring/heartbeat", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.error("Критическая ошибка отправки пульса сессии:", err);
            }
        };

        sendHeartbeat();

        const interval = setInterval(sendHeartbeat, 5000);

        return () => clearInterval(interval);
    }, []);

    return <RouterProvider router={router} />;
}

export default App
