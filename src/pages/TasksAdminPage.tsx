import { useState } from "react";
import CreateTaskPage from "./CreateTaskPage";
import ImportTasksPage from "./ImportTasksPage";

export default function TasksAdminPage() {
    const [activeTab, setActiveTab] = useState<"create" | "import">("create");

    return (
        <main style={{ padding: "20px" }}>
            <h1>Управление заданиями</h1>

            {/* Навигация по вкладкам */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                    onClick={() => setActiveTab("create")}
                    style={{
                        padding: "10px",
                        background: activeTab === "create" ? "#007bff" : "#eee",
                        color: activeTab === "create" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Создать задание
                </button>
                <button
                    onClick={() => setActiveTab("import")}
                    style={{
                        padding: "10px",
                        background: activeTab === "import" ? "#007bff" : "#eee",
                        color: activeTab === "import" ? "white" : "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Импортировать задания
                </button>
            </div>

            {/* Контент вкладок */}
            {activeTab === "create" && <CreateTaskPage />}
            {activeTab === "import" && <ImportTasksPage />}
        </main>
    );
}
