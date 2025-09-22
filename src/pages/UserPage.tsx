import { useState } from "react";
import "./UserPage.css";

function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const jsonPayload = new TextDecoder().decode(bytes);
    return JSON.parse(jsonPayload);
}

export default function UserPage() {
    const token = localStorage.getItem("accessToken");
    let username = "";
    let email = "";
    let roles: string[] = [];

    if (token) {
        try {
            const payload = parseJwt(token);
            username = payload.sub;
            email = payload.email || "";
            roles = payload.roles || [];
        } catch {
            username = "";
        }
    }

    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState(email);
    const [newPassword, setNewPassword] = useState("");

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        // Здесь будет запрос к API для обновления профиля
        console.log("Сохраняем:", { newEmail, newPassword });
        setIsEditing(false);
    }

    return (
        <div>
            <main className="profile-container">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="profile-username">{username}</h2>

                    {!isEditing ? (
                        <>
                            <p className="profile-email">{email}</p>
                            <p className="profile-roles">
                                Роли: {roles.length > 0 ? roles.join(", ") : "—"}
                            </p>
                            <button
                                className="profile-edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSave} className="profile-form">
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Новый пароль:
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </label>
                            <div className="profile-form-actions">
                                <button type="submit" className="profile-save-btn">
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
            </main>
        </div>
    );
}
