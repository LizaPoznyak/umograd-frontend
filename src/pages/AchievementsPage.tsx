import { useState } from "react";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import "../styles/AchievementsPage.css";
import Achv1 from "../assets/achv1.png";
import Achv2 from "../assets/achv2.png";
import Achv3 from "../assets/achv3.png";
import Achv4 from "../assets/achv4.png";
import Achv5 from "../assets/achv5.png";
import Achv6 from "../assets/achv6.png";

type Achievement = {
    id: number;
    image: string;   // путь к картинке
    title: string;   // новое красивое название
    stars: number;   // степень выполнения
};

const achievements: Achievement[] = [
    { id: 1, image: Achv1, title: "Покоритель старта", stars: 1 },
    { id: 2, image: Achv2, title: "Алмазный ум", stars: 2 },
    { id: 3, image: Achv3, title: "Король викторин", stars: 3 },
    { id: 4, image: Achv4, title: "Учёный исследователь", stars: 2 },
    { id: 5, image: Achv5, title: "Золотая медаль", stars: 1 },
    { id: 6, image: Achv6, title: "Любимец команды", stars: 3 },
];

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState<"received" | "all">("received");
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

    const filteredAchievements = selectedFilter
        ? achievements.filter((a) => a.stars === selectedFilter)
        : achievements;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main achievements-center">
                <div className="achievements-container">

                    {/* Вкладки */}
                    <div className="achievements-tabs">
                        <div
                            className={`tab ${activeTab === "received" ? "active" : ""}`}
                            onClick={() => setActiveTab("received")}
                        >
                            Полученные
                        </div>
                        <div
                            className={`tab ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            Все
                        </div>
                    </div>

                    {/* Сортировка + фильтры */}
                    <div className="achievements-sort-block">
                        <div className="sort-header">
                            <span className="sort-title">Фильтрация</span>
                            {selectedFilter && (
                                <div
                                    className="sort-reset"
                                    onClick={() => setSelectedFilter(null)}
                                >
                                    <span>Убрать</span>
                                    <span className="close">×</span>
                                </div>
                            )}
                        </div>

                        <div className="achievements-filters">
                            <div
                                className={`filter ${selectedFilter === 1 ? "active" : ""}`}
                                onClick={() => setSelectedFilter(1)}
                            >
                                ⭐
                            </div>
                            <div
                                className={`filter ${selectedFilter === 2 ? "active" : ""}`}
                                onClick={() => setSelectedFilter(2)}
                            >
                                ⭐⭐
                            </div>
                            <div
                                className={`filter ${selectedFilter === 3 ? "active" : ""}`}
                                onClick={() => setSelectedFilter(3)}
                            >
                                ⭐⭐⭐
                            </div>
                        </div>
                    </div>

                    {/* Сетка достижений */}
                    <div className="achievements-grid">
                        {filteredAchievements.map((a) => (
                            <div key={a.id} className="achievement-card">
                                <img src={a.image} alt={a.title} className="achievement-img"/>
                                <div className="achievement-title">{a.title}</div>
                                <div className="achievement-stars">{"⭐".repeat(a.stars)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
