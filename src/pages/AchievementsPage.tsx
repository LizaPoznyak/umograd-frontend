import { useState, useEffect } from "react";
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

type AchievementData = {
    image: string;
    title: string;
    stars: number;
};

const achievementDataMap: Record<number, AchievementData> = {
    1: { image: Achv1, title: "Снайпер", stars: 3 },
    2: { image: Achv2, title: "Алмазный ум", stars: 2 },
    3: { image: Achv3, title: "Король викторин", stars: 3 },
    4: { image: Achv4, title: "Учёный исследователь", stars: 2 },
    5: { image: Achv5, title: "Золотая медаль", stars: 1 },
    6: { image: Achv6, title: "Любимец команды", stars: 3 },
};

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState<"received" | "all">("received");
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
    const [earnedIds, setEarnedIds] = useState<number[]>([]);

    useEffect(() => {
        const fetchEarned = async () => {
            const childId = localStorage.getItem("childId");
            const token = localStorage.getItem("accessToken");
            try {
                const res = await fetch(`http://localhost:8182/api/v1/analytics/achievements/child/${childId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEarnedIds(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchEarned();
    }, []);

    const displayAchievements = Object.entries(achievementDataMap)
        .map(([id, data]) => ({ id: Number(id), ...data }))
        .filter(a => {
            const matchesTab = activeTab === "all" || earnedIds.includes(a.id);
            const matchesFilter = !selectedFilter || a.stars === selectedFilter;
            return matchesTab && matchesFilter;
        });

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main achievements-center">
                <div className="achievements-container">
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
                            {[1, 2, 3].map(num => (
                                <div
                                    key={num}
                                    className={`filter ${selectedFilter === num ? "active" : ""}`}
                                    onClick={() => setSelectedFilter(num)}
                                >
                                    {"⭐".repeat(num)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="achievements-grid">
                        {displayAchievements.map((a) => {
                            const isEarned = earnedIds.includes(a.id);
                            return (
                                <div key={a.id} className={`achievement-card ${!isEarned ? "locked" : ""}`}>
                                    <img
                                        src={a.image}
                                        alt={a.title}
                                        className="achievement-img"
                                        style={{ filter: isEarned ? "none" : "grayscale(100%) opacity(0.4)" }}
                                    />
                                    <div className="achievement-title">{a.title}</div>
                                    <div className="achievement-stars">{"⭐".repeat(a.stars)}</div>
                                    {!isEarned && <div className="lock-tag">🔒 Заблокировано</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
