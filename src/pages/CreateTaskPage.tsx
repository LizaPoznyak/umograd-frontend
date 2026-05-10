import { useState } from "react";
import "../styles/CreateTaskPage.css";

type QuestionInput = {
    type: string;
    question: string;
    options: string[];
    answer: string;
    hint: string;
};

export default function CreateTaskPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [minAge, setMinAge] = useState(6);
    const [maxAge, setMaxAge] = useState(10);
    const [difficulty, setDifficulty] = useState("EASY");
    const [questions, setQuestions] = useState<QuestionInput[]>([
        { type: "MULTIPLE_CHOICE", question: "", options: [""], answer: "", hint: "" }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, { type: "MULTIPLE_CHOICE", question: "", options: [""], answer: "", hint: "" }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push("");
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title,
            description,
            minAge,
            maxAge,
            difficulty,
            content: { questionDtos: questions }
        };

        const response = await fetch("http://localhost:8181/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Задание создано!");
            setTitle("");
            setDescription("");
            setQuestions([{ type: "MULTIPLE_CHOICE", question: "", options: [""], answer: "", hint: "" }]);
        } else {
            alert("Ошибка при создании задания");
        }
    };

    return (
        <form className="create-task-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <h3>Основная информация</h3>
                <div className="input-group">
                    <label>Заголовок</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>Описание</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="row">
                    <div className="input-group">
                        <label>Мин. возраст</label>
                        <input type="number" value={minAge} onChange={e => setMinAge(Number(e.target.value))} />
                    </div>
                    <div className="input-group">
                        <label>Макс. возраст</label>
                        <input type="number" value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} />
                    </div>
                    <div className="input-group">
                        <label>Сложность</label>
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="EASY">Лёгкое</option>
                            <option value="MEDIUM">Среднее</option>
                            <option value="HARD">Сложное</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="questions-section">
                <div className="section-header">
                    <h3>Вопросы</h3>
                </div>
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="question-card">
                        <div className="card-top">
                            <span className="card-number">Вопрос №{qIdx + 1}</span>
                            {questions.length > 1 && (
                                <button type="button" className="remove-q-btn" onClick={() => removeQuestion(qIdx)}>Удалить вопрос</button>
                            )}
                        </div>

                        <div className="row">
                            <div className="input-group">
                                <label>Тип контента</label>
                                <select value={q.type} onChange={e => updateQuestion(qIdx, "type", e.target.value)}>
                                    <option value="MULTIPLE_CHOICE">Выбор из вариантов</option>
                                    <option value="TEXT">Текстовый ответ</option>
                                    <option value="IMAGE">С картинкой</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Вопрос</label>
                            <input value={q.question} onChange={e => updateQuestion(qIdx, "question", e.target.value)} required />
                        </div>

                        {(q.type === "MULTIPLE_CHOICE" || q.type === "IMAGE") && (
                            <div className="options-container">
                                <label className="sub-label">Варианты ответов {q.type === "IMAGE" && "(ссылки)"}</label>
                                <div className="options-list">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="option-row">
                                            <input
                                                value={opt}
                                                onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                placeholder={q.type === "IMAGE" ? "URL картинки" : "Текст варианта"}
                                                required
                                            />
                                            <button type="button" className="btn-mini-del" onClick={() => removeOption(qIdx, oIdx)}>×</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="btn-mini-add" onClick={() => addOption(qIdx)}>+ Добавить вариант</button>
                            </div>
                        )}

                        <div className="row">
                            <div className="input-group">
                                <label>Правильный ответ</label>
                                <input value={q.answer} onChange={e => updateQuestion(qIdx, "answer", e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Подсказка</label>
                                <input value={q.hint} onChange={e => updateQuestion(qIdx, "hint", e.target.value)} placeholder="Появится после 3 попыток" />
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" className="add-question-btn" onClick={addQuestion}>
                    + Добавить еще один вопрос в это задание
                </button>
            </div>

            <button type="submit" className="save-task-btn">Создать задание</button>
        </form>
    );
}
