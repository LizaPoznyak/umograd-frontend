import { useState } from "react";
import CreateTaskPage from "./CreateTaskPage";
import ImportTasksPage from "./ImportTasksPage";
import EditTasksPage from "./EditTaskPage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TasksAdminPage.css";

export default function TasksAdminPage() {
    const [activeTab, setActiveTab] = useState<"create" | "import" | "edit">("create");

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="admin-header">
                    <h2>Управление заданиями</h2>
                </div>

                <div className="tabs-navigation">
                    <button
                        className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
                        onClick={() => setActiveTab("create")}
                    >
                        Создать задание
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "import" ? "active" : ""}`}
                        onClick={() => setActiveTab("import")}
                    >
                        Импортировать задания
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "edit" ? "active" : ""}`}
                        onClick={() => setActiveTab("edit")}
                    >
                        Редактировать задания
                    </button>
                </div>

                <div className="tab-content-container">
                    {activeTab === "create" && <CreateTaskPage />}
                    {activeTab === "import" && <ImportTasksPage />}
                    {activeTab === "edit" && <EditTasksPage />}
                </div>
            </main>
            <Footer />
        </div>
    );
}