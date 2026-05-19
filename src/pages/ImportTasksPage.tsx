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
        opentdb: "opentdb"
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
            handlePreview();
        } else {
            alert("Ошибка при сохранении");
        }
    };

    return (
        <div style={{ padding: "20px 0", display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{ width: "100%", maxWidth: "1000px", background: "white", borderRadius: "24px", padding: "30px", border: "1px solid rgba(0,0,0,0.02)", fontFamily: "Nunito, sans-serif" }}>

                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#2d3748", margin: "0 0 20px 0" }}>
                    Импорт заданий
                </h2>

                <div style={{ display: "flex", gap: "15px", marginBottom: "30px", background: "#f8f9fa", padding: "20px", borderRadius: "16px", border: "1px solid rgba(111,115,118,0.08)" }}>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(104, 158, 202, 0.4)", fontFamily: "Nunito", color: "#4A5568", background: "white", fontWeight: 700, cursor: "pointer", outline: "none" }}
                    >
                        <option value="opentdb">OpenTDB</option>
                    </select>
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Тема (например: Science: Mathematics)"
                        style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(104, 158, 202, 0.4)", fontFamily: "Nunito", fontSize: "14px", outline: "none" }}
                    />
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        min={1}
                        max={20}
                        style={{ width: "80px", padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(104, 158, 202, 0.4)", fontFamily: "Nunito", fontSize: "14px", textAlign: "center", outline: "none" }}
                    />
                    <button
                        onClick={handlePreview}
                        disabled={loading}
                        style={{ background: "linear-gradient(90deg, #689ECA 0%, #8FDADB 100%)", border: "none", borderRadius: "12px", padding: "0 25px", color: "#fff", fontWeight: 700, fontFamily: "Nunito", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 10px rgba(104, 158, 202, 0.15)" }}
                    >
                        {loading ? "Загрузка..." : "Предпросмотр"}
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                    {previewTasks.map((t, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedTask({ ...t })}
                            style={{ background: "white", border: "1px solid rgba(111,115,118,0.12)", padding: "20px", borderRadius: "16px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.01)", transition: "transform 0.2s, box-shadow 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(104, 158, 202, 0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.01)"; }}
                        >
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#2d3748" }}>{t.title}</h4>
                            <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#718096", lineHeight: "1.4" }}>{t.description}</p>

                            <div style={{ display: "flex", gap: "15px", fontSize: "13px", fontWeight: 700, marginBottom: t.content.type === "quiz" ? "15px" : "0" }}>
                                <span style={{ color: "#689ECA", background: "rgba(104,158,202,0.1)", padding: "4px 10px", borderRadius: "8px" }}>👶 Возраст: {t.minAge}-{t.maxAge}</span>
                                <span style={{
                                    color: t.difficulty === "EASY" ? "#7FCA68" : t.difficulty === "MEDIUM" ? "#EC9F48" : "#FA5252",
                                    background: t.difficulty === "EASY" ? "rgba(127,202,104,0.1)" : t.difficulty === "MEDIUM" ? "rgba(236,159,72,0.1)" : "rgba(250,82,82,0.1)",
                                    padding: "4px 10px",
                                    borderRadius: "8px"
                                }}>
                                    🔥 Сложность: {t.difficulty}
                                </span>
                            </div>

                            {t.content.type === "quiz" && (
                                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.02)" }}>
                                    <p style={{ margin: "0 0 10px 0", fontWeight: 700, color: "#4A5568" }}>❓ {t.content.question}</p>
                                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#718096", fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                        {t.content.options.map((opt, idx) => (
                                            <li key={idx} style={{ fontWeight: opt === t.content.answer ? 700 : 400, color: opt === t.content.answer ? "#7FCA68" : "#718096" }}>
                                                {opt} {opt === t.content.answer && "✓"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedTask && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}
                    onClick={() => setSelectedTask(null)}
                >
                    <div
                        style={{ background: "white", padding: "30px", borderRadius: "24px", width: "550px", maxHeight: "85vh", overflowY: "auto", position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 20px 0", color: "#2d3748", fontSize: "22px", fontWeight: 800 }}>Редактировать задание</h3>
                        <button onClick={() => setSelectedTask(null)} style={{ position: "absolute", top: "25px", right: "25px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#A0AEC0", outline: "none" }}>×</button>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#4A5568" }}>
                                Заголовок
                                <input type="text" value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(111,115,118,0.25)", fontSize: "14px", fontFamily: "Nunito", outline: "none" }} />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#4A5568" }}>
                                Описание
                                <textarea value={selectedTask.description} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(111,115,118,0.25)", fontSize: "14px", fontFamily: "Nunito", height: "70px", resize: "none", outline: "none" }} />
                            </label>

                            <div style={{ display: "flex", gap: "15px" }}>
                                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#4A5568" }}>
                                    Мин. возраст
                                    <input type="number" value={selectedTask.minAge} onChange={(e) => setSelectedTask({ ...selectedTask, minAge: Number(e.target.value) })} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(111,115,118,0.25)", fontSize: "14px", fontFamily: "Nunito", outline: "none" }} />
                                </label>
                                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#4A5568" }}>
                                    Макс. возраст
                                    <input type="number" value={selectedTask.maxAge} onChange={(e) => setSelectedTask({ ...selectedTask, maxAge: Number(e.target.value) })} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(111,115,118,0.25)", fontSize: "14px", fontFamily: "Nunito", outline: "none" }} />
                                </label>
                            </div>

                            <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px", fontWeight: 700, color: "#4A5568" }}>
                                Сложность
                                <select value={selectedTask.difficulty} onChange={(e) => setSelectedTask({ ...selectedTask, difficulty: e.target.value })} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(111,115,118,0.25)", fontSize: "14px", fontFamily: "Nunito", background: "white", cursor: "pointer", outline: "none" }}>
                                    <option value="EASY">Лёгкое</option>
                                    <option value="MEDIUM">Среднее</option>
                                    <option value="HARD">Сложное</option>
                                </select>
                            </label>

                            {selectedTask.content.type === "quiz" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#f8f9fa", padding: "15px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.02)" }}>
                                    <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700, color: "#4A5568" }}>
                                        Вопрос теста
                                        <input type="text" value={selectedTask.content.question} onChange={(e) => setSelectedTask({ ...selectedTask, content: { ...selectedTask.content, question: e.target.value } })} style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(111,115,118,0.2)", fontSize: "13px", fontFamily: "Nunito", outline: "none" }} />
                                    </label>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#4A5568" }}>Варианты ответов</span>
                                        {selectedTask.content.options.map((opt, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const updatedOptions = [...selectedTask.content.options];
                                                    updatedOptions[idx] = e.target.value;
                                                    setSelectedTask({ ...selectedTask, content: { ...selectedTask.content, options: updatedOptions } });
                                                }}
                                                style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(111,115,118,0.2)", fontSize: "13px", fontFamily: "Nunito", outline: "none" }}
                                            />
                                        ))}
                                    </div>

                                    <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: 700, color: "#4A5568" }}>
                                        Правильный ответ
                                        <input type="text" value={selectedTask.content.answer} onChange={(e) => setSelectedTask({ ...selectedTask, content: { ...selectedTask.content, answer: e.target.value } })} style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(111,115,118,0.2)", fontSize: "13px", fontFamily: "Nunito", outline: "none" }} />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                onClick={() => setSelectedTask(null)}
                                style={{ background: "#edf2f7", border: "none", borderRadius: "30px", padding: "12px 25px", color: "#4a5568", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSave}
                                style={{ background: "linear-gradient(90deg, #689ECA 0%, #8FDADB 100%)", border: "none", borderRadius: "30px", padding: "12px 30px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 10px rgba(104, 158, 202, 0.2)" }}
                            >
                                Сохранить задание
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
