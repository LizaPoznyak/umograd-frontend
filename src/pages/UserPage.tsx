import { useEffect, useState } from "react";
import { updateProfile } from "../api/user";
import type { UserProfile } from "../types/user";
import "./UserPage.css";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import closeIcon from "../assets/close.png";
import { useUser } from "../context/UserContext";

const roleMap: Record<string, string> = {
    ROLE_CHILD: "Ребёнок",
    ROLE_PARENT: "Родитель",
    ROLE_MODERATOR: "Модератор",
};

// функция для корректного подсчёта возраста
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

            // ⚡️ теперь берём профиль прямо из ответа
            setProfile(updatedProfile);

            setIsEditing(false);
        } catch (err) {
            console.error("Ошибка обновления профиля", err);
        }
    }

    if (!profile) return <div>Загрузка...</div>;

    const isChild = Array.isArray(profile.roles) && profile.roles.includes("ROLE_CHILD");
    const usernameFirstLetter = profile.username?.[0]?.toUpperCase() ?? "?";

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="profile-container">
                    {/* Аватар */}
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

                    {/* Поля профиля */}
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

                                    {isChild && profile.birthDate && (
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
                                    <button className="profile-stats-btn">Статистика</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="profile-form">
                                <input
                                    type="text"
                                    className="register-input"
                                    placeholder="Логин"
                                    value={form.username || ""}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    required
                                />

                                <input
                                    type="email"
                                    className="register-input"
                                    placeholder="Email"
                                    value={form.email || ""}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />

                                {isChild && (
                                    <input
                                        type="date"
                                        className="register-input"
                                        value={form.birthDate || ""}
                                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                        required
                                    />
                                )}

                                <div className="register-actions">
                                    <button type="submit" className="register-button">
                                        Сохранить
                                    </button>
                                    <button
                                        type="button"
                                        className="profile-cancel-btn"
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
        </div>
    );
}
