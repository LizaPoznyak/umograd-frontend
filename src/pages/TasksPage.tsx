import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TasksPage.css";

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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTasks = async () => {
            try {
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
        const childId = localStorage.getItem("childId"); // предполагаем, что childId хранится в localStorage
        if (!childId) {
            alert("Не найден childId для запуска задания");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8181/task-results/${taskId}/start?childId=${childId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (res.ok) {
                const taskResult = await res.json(); // TaskResultDto
                // переходим на страницу выполнения задания
                navigate(`/tasks/${taskId}/execute/${taskResult.id}`);
            } else {
                alert("Ошибка при старте задания");
            }
        } catch (err) {
            console.error("Ошибка сети", err);
        }
    };

    if (loading) {
        return <p style={{ padding: "20px" }}>Загрузка заданий...</p>;
    }

    return (
        <div>
            <main className="tasks-container">
                <h2 className="tasks-title">Задания</h2>
                <div className="tasks-grid">
                    {tasks.map((task) => (
                        <div key={task.id ?? task.sourceId} className="task-card">
                            <div className="task-icon">✓</div>
                            <h3 className="task-title">{task.title}</h3>
                            <p className="task-desc">{task.description}</p>
                            <small>
                                Возраст: {task.minAge}-{task.maxAge}, Сложность: {task.difficulty}
                            </small>
                            <button
                                className="task-btn"
                                onClick={() => handleStart(task.id)}
                            >
                                Начать
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
