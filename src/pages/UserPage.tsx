import { useEffect, useState } from "react";
import { updateProfile } from "../api/user";
import type { UserProfile } from "../types/user";
import "./UserPage.css";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import closeIcon from "../assets/close.png";
import { useUser } from "../context/UserContext";
import ProgressChart from "../components/ProgressChart.tsx";

const roleMap: Record<string, string> = {
    ROLE_CHILD: "Ребёнок",
    ROLE_PARENT: "Родитель",
    ROLE_MODERATOR: "Модератор",
};

function calcAge(dateStr: string): number {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export default function UserPage() {
    const { profile, setProfile } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<Partial<UserProfile>>({});
    const [avatar, setAvatar] = useState<string | null>(null);

    const [showChart, setShowChart] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [period, setPeriod] = useState<"day" | "week" | "month">("month");

    useEffect(() => {
        if (profile) {
            setForm(profile);
            setAvatar(profile.avatarUrl || null);
        }
    }, [profile]);

    function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            const { accessToken, refreshToken, profile: updatedProfile } = await updateProfile({
                ...form,
                avatarUrl: avatar || undefined,
            });

            if (accessToken) localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (err) {
            console.error("Ошибка обновления профиля", err);
        }
    }

    const openStatistics = async (targetChildId: number, selectedPeriod = "month") => {
        setLoadingChart(true);
        setShowChart(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8182/api/v1/analytics/report/${targetChildId}?period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setChartData(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingChart(false);
        }
    };

    const handlePeriodChange = (newPeriod: "day" | "week" | "month") => {
        setPeriod(newPeriod);
        setChartData([]);
        if (profile?.id) {
            openStatistics(profile.id, newPeriod);
        }
    };

    if (!profile) return <div>Загрузка...</div>;

    const isChild = Array.isArray(profile.roles) && profile.roles.includes("ROLE_CHILD");
    const usernameFirstLetter = profile.username?.[0]?.toUpperCase() ?? "?";

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="profile-container">
                    <div className={`profile-avatar ${isEditing ? "editable" : ""}`}>
                        {isEditing ? (
                            <label className="register-avatar">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleAvatarUpload}
                                />
                                {avatar ? (
                                    <img src={avatar} alt="Аватар" className="profile-avatar-img" />
                                ) : (
                                    <div className="avatar-fallback">{usernameFirstLetter}</div>
                                )}
                                <span className="avatar-edit-overlay">Изменить</span>
                            </label>
                        ) : (
                            <>
                                {avatar ? (
                                    <img src={avatar} alt="Аватар" className="profile-avatar-img" />
                                ) : (
                                    <div className="avatar-fallback">{usernameFirstLetter}</div>
                                )}
                            </>
                        )}

                        {isEditing && avatar && (
                            <img
                                src={closeIcon}
                                alt="Удалить"
                                className="avatar-delete-icon"
                                onClick={() => setAvatar(null)}
                            />
                        )}
                    </div>

                    <div className="profile-fields">
                        <h2 className="profile-title">Профиль</h2>

                        {!isEditing ? (
                            <div>
                                <div className="profile-info-card">
                                    <div className="profile-row">
                                        <span className="profile-label">Логин:</span>
                                        <span className="profile-value">{profile.username}</span>
                                    </div>

                                    {profile.email && (
                                        <div className="profile-row">
                                            <span className="profile-label">Email:</span>
                                            <span className="profile-value">{profile.email}</span>
                                        </div>
                                    )}

                                    <div className="profile-row">
                                        <span className="profile-label">Роль:</span>
                                        <span className="profile-value">
                                            {Array.isArray(profile.roles)
                                                ? profile.roles.map((r) => roleMap[r] || r).join(", ")
                                                : "—"}
                                        </span>
                                    </div>

                                    {profile.birthDate && (
                                        <div className="profile-row">
                                            <span className="profile-label">Возраст:</span>
                                            <span className="profile-value">{calcAge(profile.birthDate)} лет</span>
                                        </div>
                                    )}
                                </div>

                                <div className="profile-actions">
                                    <button
                                        className="profile-edit-btn"
                                        onClick={() => {
                                            setForm(profile);
                                            setAvatar(profile.avatarUrl || null);
                                            setIsEditing(true);
                                        }}
                                    >
                                        Изменить
                                    </button>

                                    {isChild && (
                                        <button
                                            className="profile-stats-btn"
                                            onClick={() => openStatistics(profile.id, period)}
                                        >
                                            Статистика
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="profile-form">
                                <label className="input-label">Логин</label>
                                <input
                                    type="text"
                                    className="register-input"
                                    placeholder="Логин"
                                    value={form.username || ""}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    required
                                />

                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="register-input"
                                    placeholder="Email"
                                    value={form.email || ""}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />

                                <label className="input-label">Дата рождения</label>
                                <div className="profile-input-group">
                                    <input
                                        type="date"
                                        className={`register-input ${isChild ? "input-disabled" : ""}`}
                                        value={form.birthDate || ""}
                                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                        disabled={isChild}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    {isChild && (
                                        <p className="input-hint">Изменение доступно только родителям</p>
                                    )}
                                </div>

                                <div className="profile-actions-edit">
                                    <button type="submit" className="profile-save-btn">Сохранить</button>
                                    <button
                                        type="button"
                                        className="profile-cancel-link"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            {showChart && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "30px", width: "550px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontFamily: "Nunito" }}>
                        <h3 style={{ margin: "0 0 15px 0", color: "#6F7376", fontSize: "24px", fontWeight: 700 }}>Динамика успешности</h3>

                        <button
                            className="no-print"
                            onClick={() => setShowChart(false)}
                            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6F7376" }}
                        >
                            ×
                        </button>

                        <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                            {(["day", "week", "month"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePeriodChange(p)}
                                    style={{
                                        padding: "6px 15px",
                                        borderRadius: "15px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontFamily: "Nunito",
                                        fontSize: "13px",
                                        backgroundColor: period === p ? "#4A90E2" : "#f1f3f5",
                                        color: period === p ? "white" : "#6F7376",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {p === "day" ? "День" : p === "week" ? "Неделя" : "Месяц"}
                                </button>
                            ))}
                        </div>

                        {loadingChart ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#6F7376" }}>Загрузка отчета...</div>
                        ) : chartData.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#718096",
                                fontSize: "16px",
                                fontWeight: 600,
                                background: "#f8f9fa",
                                borderRadius: "20px"
                            }}>
                                💡 Недостаточно данных для анализа за этот период
                            </div>
                        ) : (
                            <div>
                                <ProgressChart data={chartData} />
                                <div className="no-print" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                                    <button
                                        onClick={() => window.print()}
                                        style={{
                                            background: "linear-gradient(90deg, #7FCA68 0%, #A3DB8F 100%)",
                                            border: "none",
                                            borderRadius: "30px",
                                            padding: "10px 25px",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontFamily: "Nunito, sans-serif",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            boxShadow: "0 4px 10px rgba(127, 202, 104, 0.2)"
                                        }}
                                    >
                                        🖨️ Сохранить в PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
