import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

type TaskContentDto = {
    type: string;       // "choice" | "text"
    question: string;
    options?: string[]; // для choice
    answer: string;
};

type TaskDto = {
    id: number;
    title: string;
    description: string;
    content: TaskContentDto;
};

export default function TaskExecutionPage() {
    const { taskId, taskResultId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState<TaskDto | null>(null);
    const [selected, setSelected] = useState<string>(""); // и для текста, и для выбора
    const [attempts, setAttempts] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const res = await fetch(`http://localhost:8181/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                if (res.ok) {
                    setTask(await res.json());
                } else {
                    setMessage("Не удалось загрузить задание");
                }
            } catch {
                setMessage("Ошибка сети при загрузке задания");
            }
        };
        if (taskId) loadTask();
    }, [taskId]);

    const finishWithScore = async (score: number) => {
        setSubmitting(true);
        try {
            const url = `http://localhost:8181/task-results/${taskResultId}/finish?score=${score}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (res.ok) {
                const result = await res.json();
                alert(
                    score > 0
                        ? `Молодец! Задание выполнено. Баллы: ${result.score}. Попыток: ${attempts}.`
                        : `Задание завершено с нулём баллов. Попыток: ${attempts}.`
                );
                navigate("/tasks");
            } else {
                alert("Ошибка при завершении задания");
            }
        } catch {
            alert("Сеть недоступна. Попробуй позже.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = async () => {
        if (!task) return;
        if (!selected.trim()) {
            setMessage("Пожалуйста, введи или выбери ответ");
            return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (selected.trim() === task.content.answer) {
            await finishWithScore(1);
        } else {
            setMessage(`Ответ неверный. Попробуй ещё раз!`);
        }
    };

    const handleGiveUp = async () => {
        const confirmZero = window.confirm(
            `Ты сделал(а) ${attempts} попыток. Завершить задание с 0 баллов?`
        );
        if (confirmZero) {
            await finishWithScore(0);
        }
    };

    if (!task) return <p>Загрузка...</p>;

    return (
        <main>
            <h2>{task.title}</h2>
            <p>{task.description}</p>

            <form>
                <p>{task.content.question}</p>

                {(task.content.type.toLowerCase() === "quiz" || task.content.type.toLowerCase() === "multiple_choice") && task.content.options && (
                    task.content.options.map((opt, idx) => (
                        <label key={idx} style={{ display: "block", marginBottom: "0.5rem" }}>
                            <input
                                type="radio"
                                name="answer"
                                value={opt}
                                checked={selected === opt}
                                onChange={(e) => setSelected(e.target.value)}
                            />
                            {opt}
                        </label>
                    ))
                )}

                {task.content.type.toLowerCase() === "text" && (
                    <input
                        type="text"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        placeholder="Введи свой ответ"
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                    />
                )}

                {task.content.type.toLowerCase() === "image" && task.content.options && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {task.content.options.map((opt, idx) => (
                            <label key={idx} style={{ display: "inline-block", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="answer"
                                    value={opt}
                                    checked={selected === opt}
                                    onChange={(e) => setSelected(e.target.value)}
                                    style={{ display: "none" }}
                                />
                                <img
                                    src={opt}
                                    alt={`Вариант ${idx + 1}`}
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        border: selected === opt ? "3px solid blue" : "1px solid gray",
                                        borderRadius: "8px"
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                )}

            </form>

            {message && (
                <p style={{ color: "red", marginTop: "0.5rem" }}>
                    {message}
                </p>
            )}

            <div style={{ marginTop: "1rem" }}>
                <button onClick={handleFinish} disabled={submitting}>
                    Завершить
                </button>
                {attempts >= 3 && (
                    <button
                        onClick={handleGiveUp}
                        style={{ marginLeft: "1rem", color: "red" }}
                        disabled={submitting}
                    >
                        Сдаться
                    </button>
                )}
                <span style={{ marginLeft: "1rem" }}>
                    Попыток: <strong>{attempts}</strong>
                </span>
            </div>
        </main>
    );
}
