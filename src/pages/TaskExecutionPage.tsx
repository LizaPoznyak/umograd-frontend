import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import "../styles/TaskExecutionPage.css";

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
        <div className="app-layout">
            <Navbar/>
            <main className="app-main task-exec">
                <div className="task-header">
                    <h2 className="task-title">{task.title}</h2>
                    <div className="attempts-heart">
                        <span className="heart">❤️</span>
                        <span className="attempts-count">{attempts}</span>
                    </div>
                </div>

                <div className="task-card">
                    <p className="task-question">{task.content.question}</p>

                    {(task.content.type.toLowerCase() === "quiz" ||
                            task.content.type.toLowerCase() === "multiple_choice") &&
                        task.content.options && (
                            <div className="options">
                                {task.content.options.map((opt, idx) => (
                                    <label key={idx} className="option">
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={opt}
                                            checked={selected === opt}
                                            onChange={(e) => setSelected(e.target.value)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                    {task.content.type.toLowerCase() === "text" && (
                        <input
                            type="text"
                            className="text-answer"
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            placeholder="Введи свой ответ"
                        />
                    )}

                    {task.content.type.toLowerCase() === "image" &&
                        task.content.options && (
                            <div className="options images">
                                {task.content.options.map((opt, idx) => (
                                    <label key={idx} className="image-option">
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={opt}
                                            checked={selected === opt}
                                            onChange={(e) => setSelected(e.target.value)}
                                        />
                                        <img src={opt} alt={`Вариант ${idx + 1}`}/>
                                    </label>
                                ))}
                            </div>
                        )}
                </div>

                {/*моковое типо может быть много вопросов*/}
                <div className="task-card">
                    <p className="task-question">{task.content.question}</p>

                    {(task.content.type.toLowerCase() === "quiz" ||
                            task.content.type.toLowerCase() === "multiple_choice") &&
                        task.content.options && (
                            <div className="options">
                                {task.content.options.map((opt, idx) => (
                                    <label key={idx} className="option">
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={opt}
                                            checked={selected === opt}
                                            onChange={(e) => setSelected(e.target.value)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}
                </div>

                {message && <p className="error">{message}</p>}

                <div className="task-actions">
                    <button
                        className="finish-btn"
                        onClick={handleFinish}
                        disabled={submitting}
                    >
                        Завершить
                    </button>
                    {attempts >= 3 && (
                        <button
                            className="giveup-btn"
                            onClick={handleGiveUp}
                            disabled={submitting}
                        >
                            Сдаться
                        </button>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    );
}
