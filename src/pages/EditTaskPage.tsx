import { useEffect, useState } from "react";
import "../styles/EditTaskPage.css";
import "../styles/CreateTaskPage.css";

type QuestionDto = {
    id?: number;
    type: string;
    question: string;
    options: string[];
    answer: string;
    hint: string;
};

type TaskDto = {
    id: number;
    title: string;
    description: string;
    minAge: number;
    maxAge: number;
    difficulty: string;
    content: {
        questionDtos: QuestionDto[];
    };
};

export default function EditTasksPage() {
    const [tasks, setTasks] = useState<TaskDto[]>([]);
    const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await fetch("http://localhost:8181/tasks", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            if (res.ok) setTasks(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = (qIdx: number, field: keyof QuestionDto, value: any) => {
        if (!editingTask) return;
        const newQuestions = [...editingTask.content.questionDtos];
        newQuestions[qIdx] = { ...newQuestions[qIdx], [field]: value };
        setEditingTask({ ...editingTask, content: { questionDtos: newQuestions } });
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        if (!editingTask) return;
        const newQuestions = [...editingTask.content.questionDtos];
        newQuestions[qIdx].options[oIdx] = value;
        setEditingTask({ ...editingTask, content: { questionDtos: newQuestions } });
    };

    const handleSave = async () => {
        if (!editingTask) return;
        try {
            const res = await fetch(`http://localhost:8181/tasks/${editingTask.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify(editingTask)
            });
            if (res.ok) {
                alert("Изменения сохранены!");
                setEditingTask(null);
                loadTasks();
            }
        } catch {
            alert("Ошибка сохранения");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить это задание навсегда?")) return;
        try {
            const res = await fetch(`http://localhost:8181/tasks/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch {
            alert("Ошибка при удалении");
        }
    };

    if (loading) return <p>Загрузка...</p>;

    if (editingTask) {
        return (
            <div className="create-task-form">
                <div className="edit-nav-top">
                    <button className="back-btn" onClick={() => setEditingTask(null)}>← Назад к списку</button>
                    <button className="delete-task-btn" onClick={() => handleDelete(editingTask.id)}>Удалить всё задание</button>
                </div>

                <div className="form-section">
                    <h3>Основная информация</h3>
                    <div className="input-group">
                        <label>Заголовок</label>
                        <input value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Описание</label>
                        <textarea value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} />
                    </div>
                    <div className="row">
                        <div className="input-group">
                            <label>Мин. возраст</label>
                            <input type="number" value={editingTask.minAge} onChange={e => setEditingTask({...editingTask, minAge: +e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Макс. возраст</label>
                            <input type="number" value={editingTask.maxAge} onChange={e => setEditingTask({...editingTask, maxAge: +e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Сложность</label>
                            <select value={editingTask.difficulty} onChange={e => setEditingTask({...editingTask, difficulty: e.target.value})}>
                                <option value="EASY">Легко</option>
                                <option value="MEDIUM">Средне</option>
                                <option value="HARD">Сложно</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="questions-section">
                    <h3>Вопросы задания</h3>
                    {editingTask.content.questionDtos.map((q, qIdx) => (
                        <div key={qIdx} className="question-card">
                            <div className="card-top">
                                <span className="card-number">Вопрос №{qIdx + 1}</span>
                                <span className="card-type-badge">{q.type}</span>
                            </div>
                            <div className="input-group">
                                <label>Текст вопроса</label>
                                <input value={q.question} onChange={e => updateQuestion(qIdx, "question", e.target.value)} />
                            </div>
                            {(q.type === "MULTIPLE_CHOICE" || q.type === "IMAGE") && (
                                <div className="options-container">
                                    <label className="sub-label">Варианты ответов</label>
                                    <div className="options-list">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="option-row">
                                                <input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="row">
                                <div className="input-group">
                                    <label>Правильный ответ</label>
                                    <input value={q.answer} onChange={e => updateQuestion(qIdx, "answer", e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Подсказка</label>
                                    <input value={q.hint} onChange={e => updateQuestion(qIdx, "hint", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="save-task-btn" onClick={handleSave}>Сохранить изменения</button>
            </div>
        );
    }

    return (
        <div className="tasks-grid">
            {tasks.map(t => (
                <div key={t.id} className="task-item-card">
                    <div className="task-info">
                        <h4>{t.title}</h4>
                        <p>{t.description.slice(0, 60)}...</p>
                        <div className="task-meta">
                            <span className="q-count-badge">Вопросов: {t.content.questionDtos.length}</span>
                            <span className="age-badge">{t.minAge}-{t.maxAge} лет</span>
                        </div>
                    </div>
                    <div className="task-item-actions">
                        <button className="edit-btn" onClick={() => setEditingTask(t)}>Редактировать</button>
                        <button className="delete-small-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                </div>
            ))}
        </div>
    );
}