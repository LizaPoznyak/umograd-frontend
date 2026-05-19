import { useEffect, useState } from "react";
import { getChildren, addChild, deleteChild } from "../api/children";
import type { ChildResponse } from "../types/user";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import ProgressChart from "../components/ProgressChart.tsx";
import AggregateProgressChart from "../components/AggregateProgressChart.tsx";
import "../components/Layout.css";
import "../styles/ChildrenPage.css";

type PlatformTask = {
    id: number;
    title: string;
};

export default function ChildrenPage() {
    const [children, setChildren] = useState<ChildResponse[]>([]);
    const [allTasks, setAllTasks] = useState<PlatformTask[]>([]);
    const [childRecs, setChildRecs] = useState<Record<number, number[]>>({});
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [showChart, setShowChart] = useState(false);
    const [chartData, setChartData] = useState<any>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [period, setPeriod] = useState<"day" | "week" | "month">("month");
    const [activeChildId, setActiveChildId] = useState<number | null>(null);
    const [isAggregate, setIsAggregate] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const data = await getChildren();
            setChildren(data);

            const token = localStorage.getItem("accessToken");
            const tasksRes = await fetch("http://localhost:8181/tasks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (tasksRes.ok) {
                setAllTasks(await tasksRes.json());
            }

            for (const child of data) {
                const recsRes = await fetch (`http://localhost:8182/api/v1/analytics/active-recs/${child.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (recsRes.ok) {
                    const taskIds = await recsRes.json();
                    setChildRecs(prev => ({ ...prev, [child.id]: taskIds }));
                }
            }
        } catch {
            setError("Не удалось загрузить данные");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            await addChild(username, email, password);
            setUsername("");
            setEmail("");
            setPassword("");
            setSuccess("Ребёнок успешно добавлен");
            setTimeout(() => setSuccess(null), 3000);
            loadData();
        } catch {
            setError("Ошибка при добавлении ребёнка");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Удалить ребёнка?")) return;
        try {
            setLoading(true);
            await deleteChild(id);
            setSuccess("Ребёнок удалён");
            setTimeout(() => setSuccess(null), 3000);
            loadData();
        } catch {
            setError("Ошибка при удалении ребёнка");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    const openStatistics = async (targetChildId: number, selectedPeriod = "month") => {
        setLoadingChart(true);
        setShowChart(true);
        setIsAggregate(false);
        setActiveChildId(targetChildId);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8182/api/v1/analytics/report/${targetChildId}?period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setChartData(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingChart(false);
        }
    };

    const openAggregateStatistics = async () => {
        if (children.length === 0) return;
        setLoadingChart(true);
        setShowChart(true);
        setIsAggregate(true);
        setActiveChildId(null);
        try {
            const token = localStorage.getItem("accessToken");
            const childIds = children.map(c => c.id);
            const res = await fetch("http://localhost:8182/api/v1/analytics/report/aggregate", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(childIds)
            });
            if (res.ok) {
                const rawData = await res.json();
                const namedData: Record<string, any> = {};
                children.forEach(c => {
                    if (rawData[c.id]) {
                        namedData[c.username] = rawData[c.id];
                    }
                });
                setChartData(namedData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingChart(false);
        }
    };

    const handleSaveRecommendations = async (childId: number, taskIds: number[]) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8182/api/v1/analytics/recommend-multiple?childId=${childId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskIds)
            });
            if (res.ok) {
                setChildRecs(prev => ({ ...prev, [childId]: taskIds }));
                setSuccess("Рекомендации обновлены");
                setTimeout(() => setSuccess(null), 2000);
            }
        } catch {
            setError("Не удалось сохранить изменения");
            setTimeout(() => setError(null), 2000);
        }
    };

    const handleToggleCheckbox = (childId: number, taskId: number) => {
        const currentSelected = childRecs[childId] || [];
        let updated: number[];
        if (currentSelected.includes(taskId)) {
            updated = currentSelected.filter(id => id !== taskId);
        } else {
            updated = [...currentSelected, taskId];
        }
        handleSaveRecommendations(childId, updated);
    };

    const handleToggleConsent = async (childId: number, currentConsent: boolean) => {
        try {
            const token = localStorage.getItem("accessToken");
            const nextConsent = !currentConsent;
            const res = await fetch(`http://localhost:8080/api/v1/parent/children/${childId}/consent?consent=${nextConsent}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setChildren(prev => prev.map(c => c.id === childId ? { ...c, parentConsent: nextConsent, parent_consent: nextConsent } as any : c));
                setSuccess("Статус доступа изменен");
                setTimeout(() => setSuccess(null), 2000);
            }
        } catch {
            setError("Не удалось изменить статус доступа");
            setTimeout(() => setError(null), 2000);
        }
    };

    const handlePeriodChange = (newPeriod: "day" | "week" | "month") => {
        setPeriod(newPeriod);
        setChartData([]);
        if (activeChildId) {
            openStatistics(activeChildId, newPeriod);
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="children-page-container">
                    <h2 className="children-page-title">Мои дети</h2>

                    {children.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
                            <button
                                type="button"
                                className="child-stats-btn"
                                style={{ padding: "12px 24px", borderRadius: "30px", fontSize: "14px" }}
                                onClick={openAggregateStatistics}
                            >
                                📊 Общая статистика по всем детям
                            </button>
                        </div>
                    )}

                    {loading && <Loader />}
                    <Alert type="error" message={error} />
                    <Alert type="success" message={success} />

                    <form onSubmit={handleAdd} className="children-add-form">
                        <input
                            type="text"
                            className="children-input"
                            placeholder="Логин ребёнка"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            className="children-input"
                            placeholder="Email ребёнка"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="children-input"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="children-add-btn">Добавить ребёнка</button>
                    </form>

                    {!loading && !error && (
                        <div className="children-list-wrapper">
                            <table className="children-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Логин</th>
                                    <th>Email</th>
                                    <th>Доступ к заданиям</th>
                                    <th>Рекомендации</th>
                                    <th>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {children.map((c) => {
                                    const isConsentActive = !!((c as any).parentConsent || (c as any).parent_consent);
                                    return (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td className="child-username">{c.username}</td>
                                            <td>{c.email}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                                                    <label style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        cursor: "pointer",
                                                        fontFamily: "Nunito",
                                                        fontSize: "13px",
                                                        fontWeight: 700,
                                                        color: isConsentActive ? "#7FCA68" : "#A0AEC0",
                                                        background: "white",
                                                        padding: "6px 12px",
                                                        borderRadius: "10px",
                                                        border: "1px solid rgba(111,115,118,0.15)",
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isConsentActive}
                                                            onChange={() => handleToggleConsent(c.id, isConsentActive)}
                                                            style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#7FCA68" }}
                                                        />
                                                        <span>{isConsentActive ? "Разрешен" : "Заблокирован"}</span>
                                                    </label>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: "160px" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                                                        className="children-input"
                                                        style={{
                                                            width: "100%",
                                                            padding: "6px 12px",
                                                            borderRadius: "10px",
                                                            border: "1px solid #689ECA",
                                                            background: "white",
                                                            color: "#6F7376",
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            fontFamily: "Nunito"
                                                        }}
                                                    >
                                                        <span>Выбрано: {(childRecs[c.id] || []).length}</span>
                                                        <span>▼</span>
                                                    </button>

                                                    {openDropdownId === c.id && (
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "100%",
                                                            left: 0,
                                                            width: "220px",
                                                            background: "white",
                                                            border: "1px solid #689ECA",
                                                            borderRadius: "12px",
                                                            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                                            zIndex: 100,
                                                            maxHeight: "180px",
                                                            overflowY: "auto",
                                                            padding: "10px",
                                                            boxSizing: "border-box",
                                                            marginTop: "4px"
                                                        }}>
                                                            {allTasks.map((task) => {
                                                                const isChecked = (childRecs[c.id] || []).includes(task.id);
                                                                return (
                                                                    <label
                                                                        key={task.id}
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "8px",
                                                                            padding: "6px 4px",
                                                                            fontFamily: "Nunito",
                                                                            fontSize: "13px",
                                                                            color: "#4A5568",
                                                                            cursor: "pointer"
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handleToggleCheckbox(c.id, task.id)}
                                                                            style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                                                        />
                                                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                                {task.title}
                                                                            </span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="child-table-actions">
                                                <button
                                                    className="child-stats-btn"
                                                    onClick={() => openStatistics(c.id, period)}
                                                >
                                                    Статистика
                                                </button>
                                                <button
                                                    className="child-delete-btn"
                                                    onClick={() => handleDelete(c.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {showChart && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "30px", width: "600px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontFamily: "Nunito" }}>
                        <h3 style={{ margin: "0 0 15px 0", color: "#6F7376", fontSize: "24px", fontWeight: 700 }}>
                            {isAggregate ? "Сводный отчёт по детям" : "Динамика успешности"}
                        </h3>

                        <button
                            className="no-print"
                            onClick={() => setShowChart(false)}
                            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6F7376" }}
                        >
                            ×
                        </button>

                        {!isAggregate && (
                            <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                                {([ "day", "week", "month" ] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => handlePeriodChange(p)}
                                        style={{
                                            padding: "6px 15px",
                                            borderRadius: "15px",
                                            border: "none",
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            fontFamily: "Nunito",
                                            fontSize: "13px",
                                            backgroundColor: period === p ? "#4A90E2" : "#f1f3f5",
                                            color: period === p ? "white" : "#6F7376",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {p === "day" ? "День" : p === "week" ? "Неделя" : "Месяц"}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loadingChart ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#6F7376" }}>Загрузка отчета...</div>
                        ) : (!isAggregate && chartData.length === 0) || (isAggregate && Object.keys(chartData).length === 0) ? (
                            <div style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#718096",
                                fontSize: "16px",
                                fontWeight: 600,
                                background: "#f8f9fa",
                                borderRadius: "20px"
                            }}>
                                💡 Недостаточно данных для анализа за этот период
                            </div>
                        ) : (
                            <div>
                                {isAggregate ? (
                                    <AggregateProgressChart childrenData={chartData} />
                                ) : (
                                    <ProgressChart data={chartData} />
                                )}
                                <div className="no-print" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                                    <button
                                        onClick={() => window.print()}
                                        style={{
                                            background: "linear-gradient(90deg, #7FCA68 0%, #A3DB8F 100%)",
                                            border: "none",
                                            borderRadius: "30px",
                                            padding: "10px 25px",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontFamily: "Nunito, sans-serif",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            boxShadow: "0 4px 10px rgba(127, 202, 104, 0.2)"
                                        }}
                                    >
                                        🖨️ Сохранить в PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
