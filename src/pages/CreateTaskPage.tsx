import { useState } from "react";

export default function CreateTaskPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [minAge, setMinAge] = useState(6);
    const [maxAge, setMaxAge] = useState(10);
    const [difficulty, setDifficulty] = useState("EASY");

    // Новые поля для TaskContent
    const [type, setType] = useState("MULTIPLE_CHOICE");
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>([""]);
    const [answer, setAnswer] = useState("");

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, ""]);
    const removeOption = (index: number) =>
        setOptions(options.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8181/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify({
                title,
                description,
                minAge,
                maxAge,
                difficulty,
                content: {
                    type,
                    question,
                    options,
                    answer
                }
            })
        });

        if (response.ok) {
            alert("Задание создано!");
            setTitle("");
            setDescription("");
            setQuestion("");
            setOptions([""]);
            setAnswer("");
        } else {
            alert("Ошибка при создании задания");
        }
    };

    return (
        <main style={{ padding: "20px" }}>
            <h2>Создать задание</h2>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    maxWidth: "500px"
                }}
            >
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Заголовок"
                    required
                />
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Описание"
                    required
                />
                <input
                    type="number"
                    value={minAge}
                    onChange={e => setMinAge(Number(e.target.value))}
                    placeholder="Мин. возраст"
                />
                <input
                    type="number"
                    value={maxAge}
                    onChange={e => setMaxAge(Number(e.target.value))}
                    placeholder="Макс. возраст"
                />
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="EASY">Лёгкое</option>
                    <option value="MEDIUM">Среднее</option>
                    <option value="HARD">Сложное</option>
                </select>

                <h3>Контент задания</h3>
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="MULTIPLE_CHOICE">Выбор из вариантов</option>
                    <option value="TEXT">Текстовый ответ</option>
                    <option value="IMAGE">С картинкой</option>
                </select>

                <input
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Вопрос"
                    required
                />

                {(type === "MULTIPLE_CHOICE" || type === "IMAGE") && (
                    <div>
                        <h4>Варианты ответа {type === "IMAGE" && "(URL картинок)"}</h4>
                        {options.map((opt, i) => (
                            <div key={i} style={{ display: "flex", gap: "5px" }}>
                                <input
                                    value={opt}
                                    onChange={e => handleOptionChange(i, e.target.value)}
                                    placeholder={type === "IMAGE" ? `Ссылка на картинку ${i + 1}` : `Вариант ${i + 1}`}
                                />
                                <button type="button" onClick={() => removeOption(i)}>❌</button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption}>➕ Добавить вариант</button>
                    </div>
                )}

                <input
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Правильный ответ"
                    required
                />

                <button type="submit">Создать</button>
            </form>
        </main>
    );
}
