import "./TasksPage.css";

type Task = {
    id: number;
    title: string;
    description: string;
};

const mockTasks: Task[] = [
    { id: 1, title: "Математика: сложение", description: "Пройди тренировку по сложению чисел." },
    { id: 2, title: "Чтение", description: "Прочитай короткий рассказ и ответь на вопросы." },
    { id: 3, title: "Логика", description: "Реши головоломку на внимание и память." },
];

export default function TasksPage() {
    return (
        <div>
            <main className="tasks-container">
                <h2 className="tasks-title">Задания</h2>
                <div className="tasks-grid">
                    {mockTasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-icon">✓</div>
                            <h3 className="task-title">{task.title}</h3>
                            <p className="task-desc">{task.description}</p>
                            <button className="task-btn">Начать</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
