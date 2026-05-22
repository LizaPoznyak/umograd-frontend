import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TasksPage.css";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import Loader from "../components/Loader.tsx";
import Image from "../assets/tasks-img.png";

type Task = {
    id: number | null;
    sourceId: string | null;
    title: string;
    description: string;
    minAge: number;
    maxAge: number;
    difficulty: string;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"recommend" | "all">("all");
    const [recommendedDifficulty, setRecommendedDifficulty] = useState<string | null>(null);
    const [parentTaskIds, setParentTaskIds] = useState<number[]>([]);
    const [recommendationMessage, setRecommendationMessage] = useState<string>("");
    const [isParentDiff] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("accessToken");
                const childId = localStorage.getItem("childId");

                const tasksRes = await fetch("http://localhost:8181/tasks", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);
                }

                if (childId) {
                    try {
                        const adaptiveRes = await fetch(`http://localhost:8182/api/v1/analytics/recommendation/${childId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (adaptiveRes.ok) {
                            const adaptiveData = await adaptiveRes.json();
                            setRecommendedDifficulty(adaptiveData.recommendedDifficulty || adaptiveData.difficulty);
                            setRecommendationMessage(adaptiveData.message || "");
                            setParentTaskIds(adaptiveData.parentTaskIds || []);
                            setActiveTab("recommend");
                        }
                    } catch (err) {
                        console.error("error", err)
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    const handleStart = async (taskId: number | null) => {
        if (!taskId) {
            alert("У этого задания нет внутреннего ID, его нельзя начать напрямую");
            return;
        }
        const childId = localStorage.getItem("childId");
        if (!childId) {
            alert("Не найден childId для запуска задания");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(
                `http://localhost:8181/task-results/${taskId}/start?childId=${childId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            if (res.ok) {
                const taskResult = await res.json();
                navigate(`/tasks/${taskId}/execute/${taskResult.id}`);
            } else {
                alert("Ошибка при старте задания");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredByTab = activeTab === "recommend"
        ? (parentTaskIds && parentTaskIds.length > 0
            ? tasks.filter((t) => parentTaskIds.includes(t.id || 0) && (t.difficulty === recommendedDifficulty))
            : tasks.filter((t) => t.difficulty === recommendedDifficulty))
        : tasks;

    const finalFilteredTasks = selectedDifficulty
        ? filteredByTab.filter((t) => t.difficulty === selectedDifficulty)
        : filteredByTab;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main tasks-center">
                <div className="tasks-container">
                    <div className="tasks-bar">
                        <div className="tabs">
                            <div
                                className={`tab ${activeTab === "recommend" ? "active" : ""}`}
                                onClick={() => setActiveTab("recommend")}
                            >
                                Рекомендации
                            </div>
                            <div
                                className={`tab ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                Все
                            </div>
                        </div>

                        <div className="filter-box">
                            <div className="filter-header">
                                <span className="filter-title">Фильтрация</span>
                                {selectedDifficulty && (
                                    <div
                                        className="filter-reset"
                                        onClick={() => setSelectedDifficulty(null)}
                                    >
                                        <span>Убрать</span>
                                        <span className="close">×</span>
                                    </div>
                                )}
                            </div>

                            <div className="filter-options">
                                <div
                                    className={`filter-option ${selectedDifficulty === "EASY" ? "active" : ""}`}
                                    onClick={() => setSelectedDifficulty("EASY")}
                                >
                                    🔥
                                </div>
                                <div
                                    className={`filter-option ${selectedDifficulty === "MEDIUM" ? "active" : ""}`}
                                    onClick={() => setSelectedDifficulty("MEDIUM")}
                                >
                                    🔥🔥
                                </div>
                                <div
                                    className={`filter-option ${selectedDifficulty === "HARD" ? "active" : ""}`}
                                    onClick={() => setSelectedDifficulty("HARD")}
                                >
                                    🔥🔥🔥
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeTab === "recommend" && recommendationMessage && (
                        <div style={{
                            background: "rgba(74, 144, 226, 0.15)",
                            padding: "15px 25px",
                            borderRadius: "15px",
                            marginBottom: "20px",
                            fontFamily: "Nunito, sans-serif",
                            color: "#2d3748",
                            fontSize: "14px",
                            fontWeight: 600,
                            borderLeft: "5px solid #4A90E2",
                            boxSizing: "border-box"
                        }}>
                            💡 {recommendationMessage}
                        </div>
                    )}

                    <div className={`tasks-list ${finalFilteredTasks.length === 0 ? "empty" : ""}`}>
                        {finalFilteredTasks.length === 0 ? (
                            <div className="no-tasks">
                                Заданий с такой сложностью пока нет
                            </div>
                        ) : (
                            finalFilteredTasks.map((task) => {
                                const isParentAssigned = parentTaskIds && parentTaskIds.includes(task.id || 0);
                                const isRec = isParentAssigned || (activeTab === "recommend") || (recommendedDifficulty === task.difficulty && !parentTaskIds.length && !isParentDiff);

                                return (
                                    <div
                                        key={task.id ?? task.sourceId}
                                        className={`tasks-item ${isRec ? "is-recommended-card" : ""}`}
                                        style={{
                                            border: isParentAssigned ? "2px solid #689ECA" : undefined,
                                            background: isParentAssigned ? "rgba(104, 158, 202, 0.02)" : undefined
                                        }}
                                    >
                                        {isRec && (
                                            <span
                                                className="task-recommend-badge"
                                                style={{ backgroundColor: isParentAssigned ? "#689ECA" : undefined }}
                                            >
                                                {isParentAssigned ? "От родителя" : "Рекомендовано"}
                                            </span>
                                        )}
                                        <img src={Image} alt="Картинка задания" className="tasks-img"/>
                                        <div className="tasks-info-btn">
                                            <div className="tasks-info">
                                                <p className="tasks-title">{task.title}</p>
                                                <div className="tasks-description-diff">
                                                    <p className="tasks-description" title={task.description}>
                                                        {task.description}
                                                    </p>
                                                    <p className="tasks-diff">
                                                        {task.difficulty === "EASY" && "🔥"}
                                                        {task.difficulty === "MEDIUM" && "🔥🔥"}
                                                        {task.difficulty === "HARD" && "🔥🔥🔥"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="tasks-btn"
                                                onClick={() => handleStart(task.id)}
                                                disabled={loading}
                                            >
                                                {loading ? "Старт..." : "Начать"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                {loading && <Loader/>}
            </main>
            <Footer/>
        </div>
    );
}
