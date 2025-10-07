import { useState } from "react";

type ExternalTaskDto = {
    title: string;
    description: string;
    minAge: number;
    maxAge: number;
    difficulty: string;
    content: {
        type: string;
        question: string;
        options: string[];
        answer: string;
    };
};

type TaskDto = ExternalTaskDto & {
    id?: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function ImportTasksPage() {
    const [provider, setProvider] = useState("opentdb");
    const [topic, setTopic] = useState("Science: Mathematics");
    const [limit, setLimit] = useState(5);
    const [previewTasks, setPreviewTasks] = useState<ExternalTaskDto[]>([]);
    const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
    const [loading, setLoading] = useState(false);

    const providerMap: Record<string, string> = {
        opentdb: "opentdb",
        // dictionary: "dictionary",
        // numbers: "numbers",
    };

    const handlePreview = async () => {
        setLoading(true);
        const realProvider = providerMap[provider];
        try {
            const res = await fetch(
                `http://localhost:8181/tasks/import/preview?provider=${realProvider}&topic=${encodeURIComponent(
                    topic
                )}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            if (res.ok) {
                setPreviewTasks(await res.json());
            } else {
                alert("Ошибка при загрузке заданий");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTask) return;
        const res = await fetch(`http://localhost:8181/tasks/import/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(selectedTask),
        });
        if (res.ok) {
            alert("Задание сохранено!");
            setSelectedTask(null);
        } else {
            alert("Ошибка при сохранении");
        }
    };

    return (
        <main style={{ padding: "20px" }}>
            <h2>Импорт заданий</h2>

            {/* Форма предпросмотра */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                    <option value="opentdb">OpenTDB</option>
                    {/* <option value="dictionary">Dictionary</option> */}
                    {/* <option value="numbers">Numbers API</option> */}
                </select>
                <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема (например: Science: Mathematics)"
                />
                <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    min={1}
                    max={20}
                />
                <button onClick={handlePreview} disabled={loading}>
                    {loading ? "Загрузка..." : "Предпросмотр"}
                </button>
            </div>

            {/* Список карточек */}
            <div style={{ display: "grid", gap: "10px" }}>
                {previewTasks.map((t, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedTask({ ...t })}
                    >
                        <h4>{t.title}</h4>
                        <p>{t.description}</p>
                        <small>
                            Возраст: {t.minAge}-{t.maxAge}, Сложность: {t.difficulty}
                        </small>

                        {t.content.type === "quiz" && (
                            <div style={{ marginTop: "10px" }}>
                                <p><b>{t.content.question}</b></p>
                                <ul>
                                    {t.content.options.map((opt, idx) => (
                                        <li key={idx}>{opt}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Модальное окно редактирования */}
            {selectedTask && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={() => setSelectedTask(null)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            minWidth: "400px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Редактировать задание</h3>

                        <input
                            value={selectedTask.title}
                            onChange={(e) =>
                                setSelectedTask({ ...selectedTask, title: e.target.value })
                            }
                            placeholder="Заголовок"
                        />
                        <textarea
                            value={selectedTask.description}
                            onChange={(e) =>
                                setSelectedTask({
                                    ...selectedTask,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Описание"
                        />
                        <input
                            type="number"
                            value={selectedTask.minAge}
                            onChange={(e) =>
                                setSelectedTask({
                                    ...selectedTask,
                                    minAge: Number(e.target.value),
                                })
                            }
                            placeholder="Мин. возраст"
                        />
                        <input
                            type="number"
                            value={selectedTask.maxAge}
                            onChange={(e) =>
                                setSelectedTask({
                                    ...selectedTask,
                                    maxAge: Number(e.target.value),
                                })
                            }
                            placeholder="Макс. возраст"
                        />
                        <select
                            value={selectedTask.difficulty}
                            onChange={(e) =>
                                setSelectedTask({
                                    ...selectedTask,
                                    difficulty: e.target.value,
                                })
                            }
                        >
                            <option value="EASY">Лёгкое</option>
                            <option value="MEDIUM">Среднее</option>
                            <option value="HARD">Сложное</option>
                        </select>

                        {selectedTask.content.type === "quiz" && (
                            <>
                                <h4>Вопрос</h4>
                                <input
                                    value={selectedTask.content.question}
                                    onChange={(e) =>
                                        setSelectedTask({
                                            ...selectedTask,
                                            content: {
                                                ...selectedTask.content,
                                                question: e.target.value,
                                            },
                                        })
                                    }
                                />

                                <h4>Варианты</h4>
                                {selectedTask.content.options.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...selectedTask.content.options];
                                            newOpts[idx] = e.target.value;
                                            setSelectedTask({
                                                ...selectedTask,
                                                content: {
                                                    ...selectedTask.content,
                                                    options: newOpts,
                                                },
                                            });
                                        }}
                                    />
                                ))}

                                <h4>Правильный ответ</h4>
                                <input
                                    value={selectedTask.content.answer}
                                    onChange={(e) =>
                                        setSelectedTask({
                                            ...selectedTask,
                                            content: {
                                                ...selectedTask.content,
                                                answer: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </>
                        )}

                        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                            <button onClick={handleSave}>Сохранить</button>
                            <button onClick={() => setSelectedTask(null)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
