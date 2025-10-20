import { useState } from "react";
import "./UserPage.css";
import Navbar from "../components/Navbar.tsx";
import "../components/Layout.css";
import Footer from "../components/Footer.tsx";
import MockAvatar from "../assets/mock-avatar.png";

function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const jsonPayload = new TextDecoder().decode(bytes);
    return JSON.parse(jsonPayload);
}

/*function calcAge(birthDate: string) {
    if (!birthDate) return "";
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}*/

const roleMap: Record<string, string> = {
    ROLE_CHILD: "Ребёнок",
    ROLE_PARENT: "Родитель",
    ROLE_MODERATOR: "Модератор",
};

export default function UserPage() {
    const token = localStorage.getItem("accessToken");
    let username = "";
    let email = "";
    let roles: string[] = [];
    let birthDate = "";

    if (token) {
        try {
            const payload = parseJwt(token);
            username = payload.username || "";
            email = payload.email || "";
            roles = payload.roles || [];
            birthDate = payload.birthDate || "";
        } catch {
            username = "";
        }
    }

    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(username);
    const [newEmail, setNewEmail] = useState(email);
    const [newBirthDate, setNewBirthDate] = useState(birthDate);

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        console.log("Сохраняем:", { newUsername, newEmail, newBirthDate });
        setIsEditing(false);
    }

    const isChild = roles.includes("ROLE_CHILD");

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="profile-container">
                    <div className="profile-avatar">
                        <img src={MockAvatar} alt="Моковый аватар" className="profile-avatar-img"/>
                    </div>

                    <div className="profile-fields">
                        <h2 className="profile-title">Профиль</h2>

                        {!isEditing ? (
                            <div>
                                <div className="profile-info-card">
                                    <div className="profile-row">
                                        <span className="profile-label">Логин:</span>
                                        <span className="profile-value">{username}</span>
                                    </div>

                                    {email && (
                                        <div className="profile-row">
                                            <span className="profile-label">Email:</span>
                                            <span className="profile-value">{email}</span>
                                        </div>
                                    )}

                                    <div className="profile-row">
                                        <span className="profile-label">Роль:</span>
                                        <span className="profile-value">
                      {roles.length > 0 ? roles.map(r => roleMap[r] || r).join(", ") : "—"}
                    </span>
                                    </div>

                                    {isChild && (
                                        <div className="profile-row">
                                            <span className="profile-label">Возраст:</span>
                                            <span className="profile-value">10{/*{calcAge(birthDate)}*/} лет</span>
                                        </div>
                                    )}
                                </div>

                                <div className="profile-actions">
                                    <button
                                        className="profile-edit-btn"
                                        onClick={() => setIsEditing(true)}
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
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    required
                                />

                                <input
                                    type="email"
                                    className="register-input"
                                    placeholder="Email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />

                                {isChild && (
                                    <input
                                        type="date"
                                        className="register-input"
                                        value={newBirthDate}
                                        onChange={(e) => setNewBirthDate(e.target.value)}
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
