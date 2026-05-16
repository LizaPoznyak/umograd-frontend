import { useEffect, useState, type JSX } from "react";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import "../components/Layout.css";

type LogError = {
    id: number;
    userId: number;
    username: string;
    eventType: string;
    endpoint: string;
    description: string;
    createdAt: string;
};

export default function SystemMonitoringPage(): JSX.Element {
    const [activeSessions, setActiveSessions] = useState<number>(0);
    const [errorLogs, setErrorLogs] = useState<LogError[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [blockingId, setBlockingId] = useState<number | null>(null);

    const fetchData = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const sessionsRes = await fetch("http://localhost:8182/api/v1/analytics/logs/monitoring/active-sessions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                setActiveSessions(data.count);
            }

            const errorsRes = await fetch("http://localhost:8182/api/v1/analytics/logs/monitoring/errors", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (errorsRes.ok) {
                setErrorLogs(await errorsRes.json());
            }
        } catch (err) {
            console.error("Ошибка обновления данных мониторинга:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleBlockUser = async (userId: number, username: string) => {
        if (!window.confirm(`Заблокировать учетную запись пользователя ${username}?`)) return;
        try {
            setBlockingId(userId);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8181/users/${userId}/block`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert(`Пользователь ${username} успешно заблокирован.`);
                fetchData();
            } else {
                alert("Не удалось заблокировать пользователя");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setBlockingId(null);
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", boxSizing: "border-box" }}>
                <div style={{
                    width: "100%",
                    maxWidth: "850px",
                    background: "rgba(255, 255, 255, 0.4)",
                    borderRadius: "30px",
                    padding: "40px",
                    boxSizing: "border-box",
                    fontFamily: "Nunito, sans-serif",
                    color: "#6F7376"
                }}>
                    <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 30px 0", textAlign: "center" }}>Системный мониторинг</h2>

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(104, 158, 202, 0.12)",
                        padding: "25px 30px",
                        borderRadius: "20px",
                        border: "1px solid rgba(104, 158, 202, 0.2)",
                        marginBottom: "35px"
                    }}>
                        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.5px" }}>
                            Активные сессии в реальном времени
                        </span>

                        {loading ? (
                            <div style={{ fontSize: "18px", fontWeight: 600 }}>Загрузка...</div>
                        ) : (
                            <div style={{ fontSize: "36px", fontWeight: 800, color: "#4A90E2", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span>⚡</span> {activeSessions}
                            </div>
                        )}
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.5)", borderRadius: "20px", padding: "25px", border: "1px solid rgba(0,0,0,0.03)" }}>
                        <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 20px 0", color: "#6F7376" }}>Журнал системных сбоев</h3>

                        {errorLogs.length === 0 ? (
                            <p style={{ textAlign: "center", fontStyle: "italic", color: "#888", margin: "20px 0" }}>
                                Критических сбоев и ошибок в системе не зафиксировано
                            </p>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", color: "#6F7376" }}>
                                    <thead>
                                    <tr style={{ borderBottom: "2px solid rgba(111, 115, 118, 0.2)" }}>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "15px", fontWeight: 700 }}>Дата</th>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "15px", fontWeight: 700 }}>Пользователь</th>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "15px", fontWeight: 700 }}>Эндпоинт</th>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "15px", fontWeight: 700 }}>Описание инцидента</th>
                                        <th style={{ padding: "12px", textAlign: "center", fontSize: "15px", fontWeight: 700 }}>Действие</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {errorLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(111, 115, 118, 0.1)" }}>
                                            <td style={{ padding: "12px", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                {log.createdAt ? log.createdAt.replace("T", " ").substring(0, 16) : "—"}
                                            </td>
                                            <td style={{ padding: "12px", fontWeight: 700 }}>{log.username}</td>
                                            <td style={{ padding: "12px", fontSize: "13px", fontFamily: "monospace", color: "#4A90E2" }}>
                                                {log.endpoint || "—"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#fa5252", fontSize: "13px", lineHeight: "1.4" }}>
                                                ⚠️ {log.description}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "center" }}>
                                                <button
                                                    disabled={blockingId === log.userId}
                                                    onClick={() => handleBlockUser(log.userId, log.username)}
                                                    style={{
                                                        background: "#FF8F8F",
                                                        border: "none",
                                                        borderRadius: "15px",
                                                        padding: "6px 14px",
                                                        color: "white",
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        fontFamily: "Nunito, sans-serif",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    Блокировать
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
