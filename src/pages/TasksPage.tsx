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
    const [activeTab, setActiveTab] = useState<"recommend" | "all">("recommend");

    const navigate = useNavigate();

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8181/tasks", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                } else {
                    console.error("Ошибка загрузки заданий", res.status);
                }
            } catch (err) {
                console.error("Ошибка сети", err);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
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
            console.error("Ошибка сети", err);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация по сложности
    const filteredTasks = selectedDifficulty
        ? tasks.filter((t) => t.difficulty === selectedDifficulty)
        : tasks;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main tasks-center">
                <div className="tasks-container">
                    {/* Панель фильтрации */}
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
                                    className={`filter-option ${
                                        selectedDifficulty === "EASY" ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedDifficulty("EASY")}
                                >
                                    🔥
                                </div>
                                <div
                                    className={`filter-option ${
                                        selectedDifficulty === "MEDIUM" ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedDifficulty("MEDIUM")}
                                >
                                    🔥🔥
                                </div>
                                <div
                                    className={`filter-option ${
                                        selectedDifficulty === "HARD" ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedDifficulty("HARD")}
                                >
                                    🔥🔥🔥
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Список заданий */}
                    <div className={`tasks-list ${filteredTasks.length === 0 ? "empty" : ""}`}>
                        {filteredTasks.length === 0 ? (
                            <div className="no-tasks">
                                Заданий с такой сложностью пока нет
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div key={task.id ?? task.sourceId} className="tasks-item">
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
                            ))
                        )}
                    </div>
                </div>
                {loading && <Loader/>}
            </main>
            <Footer/>
        </div>
    );
}