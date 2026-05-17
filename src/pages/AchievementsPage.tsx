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

type BackendAchievement = {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    conditionValue: number;
};

const fallbackImages: Record<number, string> = {
    1: Achv1,
    2: Achv2,
    3: Achv3,
    4: Achv4,
    5: Achv5,
    6: Achv6,
};

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState<"received" | "all">("received");
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
    const [allAchievements, setAllAchievements] = useState<BackendAchievement[]>([]);
    const [earnedIds, setEarnedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAchievementsData = async () => {
            const childId = localStorage.getItem("childId");
            const token = localStorage.getItem("accessToken");
            try {
                setLoading(true);

                const earnedRes = await fetch(`http://localhost:8182/api/v1/analytics/achievements/child/${childId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (earnedRes.ok) {
                    setEarnedIds(await earnedRes.json());
                }

                const allRes = await fetch(`http://localhost:8182/api/v1/analytics/achievements`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (allRes.ok) {
                    setAllAchievements(await allRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAchievementsData();
    }, []);

    const displayAchievements = allAchievements
        .map((a) => {
            const starsCount = a.conditionValue > 5 ? 3 : a.conditionValue > 2 ? 2 : 1;
            const localImage = fallbackImages[a.id] || Achv1;
            return {
                id: a.id,
                title: a.name,
                description: a.description,
                image: a.iconUrl || localImage,
                stars: starsCount
            };
        })
        .filter((a) => {
            const matchesTab = activeTab === "all" || earnedIds.includes(a.id);
            const matchesFilter = !selectedFilter || a.stars === selectedFilter;
            return matchesTab && matchesFilter;
        });

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main achv-page-main">
                <div className="achv-main-container">

                    <div className="achv-sidebar-panel">
                        <div className="achv-nav-tabs">
                            <div
                                className={`achv-tab-item ${activeTab === "received" ? "active" : ""}`}
                                onClick={() => setActiveTab("received")}
                            >
                                Полученные
                            </div>
                            <div
                                className={`achv-tab-item ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                Все
                            </div>
                        </div>

                        <div className="achv-filter-box">
                            <div className="achv-filter-header">
                                <span className="achv-filter-title">Фильтрация</span>
                                {selectedFilter && (
                                    <div className="achv-filter-reset" onClick={() => setSelectedFilter(null)}>
                                        <span>Убрать ×</span>
                                    </div>
                                )}
                            </div>

                            <div className="achv-filter-options">
                                {[1, 2, 3].map(num => (
                                    <div
                                        key={num}
                                        className={`achv-filter-btn ${selectedFilter === num ? "active" : ""}`}
                                        onClick={() => setSelectedFilter(num)}
                                    >
                                        {"⭐".repeat(num)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="achv-content-area">
                        {loading ? (
                            <div className="achv-status-text">Загрузка наград...</div>
                        ) : displayAchievements.length === 0 ? (
                            <div className="achv-status-text">Достижений в этой категории пока нет</div>
                        ) : (
                            <div className="achv-grid-layout">
                                {displayAchievements.map((a) => {
                                    const isEarned = earnedIds.includes(a.id);
                                    return (
                                        <div key={a.id} className={`achv-card-item ${!isEarned ? "is-locked" : ""}`}>
                                            <div className="achv-card-top">
                                                <img
                                                    src={a.image}
                                                    alt={a.title}
                                                    className="achv-card-img"
                                                    style={{ filter: isEarned ? "none" : "drop-shadow(0px 4px 10px rgba(0,0,0,0.15)) grayscale(100%) opacity(0.25)" }}
                                                />
                                            </div>
                                            <div className="achv-card-middle">
                                                <div className="achv-card-title">{a.title}</div>
                                                <div className="achv-card-desc" title={a.description}>
                                                    {a.description || "Описание отсутствует"}
                                                </div>
                                            </div>
                                            <div className="achv-card-bottom">
                                                <div className="achv-card-stars">{"⭐".repeat(a.stars)}</div>
                                                {!isEarned && <div className="achv-lock-badge">🔒 Заблокировано</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
