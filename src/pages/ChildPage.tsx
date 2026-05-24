import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import Loader from "../components/Loader.tsx";

import "../components/Layout.css";
import "../styles/ChildPage.css";
import "../styles/TasksPage.css";

import Image from "../assets/tasks-img.png";

import { useUser } from "../context/UserContext.tsx";

type Task = {
    id: number | null;
    sourceId: string | null;
    title: string;
    description: string;
    minAge: number;
    maxAge: number;
    difficulty: string;
};

export default function ChildPage() {

    const { profile } = useUser();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const [recommendedDifficulty, setRecommendedDifficulty] = useState<string | null>(null);
    const [parentTaskIds, setParentTaskIds] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("accessToken");
                const childId = localStorage.getItem("childId");

                const tasksRes = await fetch("http://localhost:8181/tasks", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);
                }

                if (childId) {
                    const adaptiveRes = await fetch(
                        `http://localhost:8182/api/v1/analytics/recommendation/${childId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (adaptiveRes.ok) {
                        const adaptiveData = await adaptiveRes.json();

                        setRecommendedDifficulty(
                            adaptiveData.recommendedDifficulty || adaptiveData.difficulty
                        );

                        setParentTaskIds(adaptiveData.parentTaskIds || []);
                    }
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleStart = async (taskId: number | null) => {

        if (!taskId) {
            alert("У задания нет ID");
            return;
        }

        const childId = localStorage.getItem("childId");

        if (!childId) {
            alert("Не найден childId");
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
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Логика рекомендаций как в TasksPage
    const recommendedTasks =
        parentTaskIds.length > 0
            ? tasks.filter(
                (t) =>
                    parentTaskIds.includes(t.id || 0) &&
                    t.difficulty === recommendedDifficulty
            )
            : tasks.filter(
                (t) => t.difficulty === recommendedDifficulty
            );

    // Берем только 4
    const topTasks = recommendedTasks.slice(0, 4);

    return (
        <div className="app-layout">
            <Navbar />

            <main className="app-main child-main">

                <div className="child-greeting">
                    <h1 className="child-text">
                        Привет, {profile?.username},
                    </h1>

                    <h2 className="child-subtitle">
                        Давай выполним ежедневный квест
                    </h2>
                </div>

                <div className="child-container">

                    <div className="tasks-list">

                        {topTasks.map((task) => {

                            const isParentAssigned =
                                parentTaskIds.includes(task.id || 0);

                            return (
                                <div
                                    key={task.id ?? task.sourceId}
                                    className="tasks-item is-recommended-card"
                                    style={{
                                        border: isParentAssigned
                                            ? "2px solid #689ECA"
                                            : undefined,

                                        background: isParentAssigned
                                            ? "rgba(104, 158, 202, 0.02)"
                                            : undefined
                                    }}
                                >

                                    <span
                                        className="task-recommend-badge"
                                        style={{
                                            backgroundColor: isParentAssigned
                                                ? "#689ECA"
                                                : undefined
                                        }}
                                    >
                                        {isParentAssigned
                                            ? "От родителя"
                                            : "Рекомендовано"}
                                    </span>

                                    <img
                                        src={Image}
                                        alt="Картинка задания"
                                        className="tasks-img"
                                    />

                                    <div className="tasks-info-btn">

                                        <div className="tasks-info">

                                            <p className="tasks-title">
                                                {task.title}
                                            </p>

                                            <div className="tasks-description-diff">

                                                <p
                                                    className="tasks-description"
                                                    title={task.description}
                                                >
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
                        })}

                    </div>
                </div>

                {loading && <Loader />}

            </main>

            <Footer />
        </div>
    );
}