import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import "../styles/TaskExecutionPage.css";

type questionDtosDto = {
    type: string;
    question: string;
    options?: string[];
    answer: string;
    hint?: string;
};

type TaskContentDto = {
    questionDtos: questionDtosDto[];
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
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selected, setSelected] = useState<string>("");
    const [attempts, setAttempts] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showHint, setShowHint] = useState<boolean>(false);

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
                setMessage("Ошибка сети");
            }
        };
        if (taskId) loadTask();
    }, [taskId]);

    const currentQuestion = task?.content?.questionDtos?.[currentIndex];

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

                try {
                    const childId = localStorage.getItem("childId");
                    const analyticRes = await fetch(`http://localhost:8182/api/v1/analytics/achievements/process/${childId}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                            "Content-Type": "application/json"
                        },
                    });

                    if (analyticRes.ok) {
                        const earned = await analyticRes.json();
                        if (earned && earned.length > 0) {
                            alert(`Поздравляем! Получены награды: ${earned.map((a: any) => a.name).join(", ")}`);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }

                alert(`Задание выполнено! Баллы: ${result.score}. Попыток: ${attempts}.`);
                navigate("/tasks");
            }
        } catch {
            alert("Ошибка связи с сервером");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = async () => {
        if (!currentQuestion) return;
        if (!selected.trim()) {
            setMessage("Пожалуйста, выбери ответ");
            return;
        }

        const isCorrect = selected.trim() === currentQuestion.answer;

        if (!isCorrect) {
            setAttempts(prev => prev + 1);
            setMessage("Ответ неверный. Попробуй еще раз!");
            return;
        }

        setMessage("");
        setSelected("");
        setShowHint(false);

        if (currentIndex < (task?.content.questionDtos.length || 0) - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            await finishWithScore(100);
        }
    };

    if (!task || !task.content || !task.content.questionDtos) {
        return <p>Загрузка...</p>;
    }

    if (task.content.questionDtos.length === 0 || !currentQuestion) {
        return <p>В задании нет вопросов</p>;
    }

    return (
        <div className="app-layout execution-layout">
            <Navbar/>
            <main className="app-main task-exec">
                <div className="task-execution-box">
                    <div className="task-header">
                        <div>
                            <h2 className="task-title">{task.title}</h2>
                            <p className="task-progress-text">Вопрос {currentIndex + 1} из {task.content.questionDtos.length}</p>
                        </div>
                        <div className="attempts-heart">
                            <span className="heart">❤️</span>
                            <span className="attempts-count">{attempts}</span>
                        </div>
                    </div>

                    <div className="task-card">
                        <p className="task-question">{currentQuestion.question}</p>

                        {(currentQuestion.type.toLowerCase() === "quiz" ||
                            currentQuestion.type.toLowerCase() === "multiple_choice") && (
                            <div className="options">
                                {currentQuestion.options?.map((opt, idx) => (
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

                        {currentQuestion.type.toLowerCase() === "text" && (
                            <input
                                type="text"
                                className="text-answer"
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                placeholder="Введи свой ответ"
                            />
                        )}

                        {currentQuestion.type.toLowerCase() === "image" && (
                            <div className="options images">
                                {currentQuestion.options?.map((opt, idx) => (
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

                        {showHint && currentQuestion.hint && (
                            <div className="hint-box">
                                💡 <strong>Подсказка:</strong> {currentQuestion.hint}
                            </div>
                        )}
                    </div>

                    {message && <p className="error">{message}</p>}

                    <div className="task-actions">
                        <button className="finish-btn" onClick={handleNext} disabled={submitting}>
                            {currentIndex < task.content.questionDtos.length - 1 ? "Далее" : "Завершить"}
                        </button>

                        {attempts >= 3 && (
                            <div className="help-actions">
                                {!showHint && currentQuestion.hint && (
                                    <button className="hint-btn" onClick={() => setShowHint(true)}>
                                        Подсказка
                                    </button>
                                )}
                                <button className="giveup-btn" onClick={() => finishWithScore(0)} disabled={submitting}>
                                    Сдаться
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
