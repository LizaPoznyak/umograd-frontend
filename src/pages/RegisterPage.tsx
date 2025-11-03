import { useState } from "react";
import { register } from "../api/auth";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import "../components/Layout.css";
import "../styles/RegisterPage.css";
import Footer from "../components/Footer.tsx";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isParent, setIsParent] = useState(true);
    const [birthDate, setBirthDate] = useState("");
    const [parentUsername, setParentUsername] = useState<string>("");

    function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            if (password !== confirmPassword) {
                setError("Пароли не совпадают");
                return;
            }
            if (!username.trim()) {
                setError("Введите логин");
                return;
            }
            if (!isParent && !birthDate) {
                setError("Для регистрации ребёнка укажите дату рождения");
                return;
            }

            const payload = {
                username,
                email: email || undefined,
                password,
                isParent,
                birthDate: !isParent ? birthDate : undefined,
                parentUsername: !isParent && parentUsername ? parentUsername : undefined,
                avatarUrl: avatar || undefined,
            };

            const tokens = await register(payload);
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);

            setSuccess("Регистрация успешна!");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setBirthDate("");
            setAvatar(null);
            setParentUsername("");

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Ошибка регистрации");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <main className="app-main">
                <h2 className="register-title">Регистрация</h2>
                <form onSubmit={handleRegister} className="register-form">
                    <label className="register-avatar">
                        <input
                            type="file"
                            accept="image/*"
                            style={{display: "none"}}
                            onChange={handleAvatarUpload}
                        />
                        {avatar ? (
                            <img src={avatar} alt="Аватар" className="register-avatar-preview"/>
                        ) : (
                            <span>Загрузить аватар</span>
                        )}
                    </label>
                    <div className="register-fields">
                        <input
                            type="text"
                            placeholder="Логин"
                            className="register-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email (необязательно)"
                            className="register-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            className="register-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Подтверждение пароля"
                            className="register-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {/* Если регистрируется ребёнок — показать дату рождения и при желании parentId */}
                        {!isParent && (
                            <>
                                <input
                                    type="date"
                                    placeholder="Дата рождения"
                                    className="register-input"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Username родителя (необязательно)"
                                    className="register-input"
                                    value={parentUsername}
                                    onChange={(e) => setParentUsername(e.target.value)}
                                />
                            </>
                        )}

                        <label className="register-checkbox">
                            <input
                                type="checkbox"
                                checked={isParent}
                                onChange={(e) => setIsParent(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Я родитель
                        </label>

                        <div className="register-actions">
                            <button type="submit" className="register-button" disabled={loading}>
                                {loading ? "Регистрация..." : "Зарегистрироваться"}
                            </button>
                            <a href="/" className="register-login">Вход</a>
                        </div>
                    </div>
                </form>
                {loading && <Loader/>}
                <Alert type="error" message={error}/>
                <Alert type="success" message={success}/>
            </main>
            <Footer/>
        </div>
    );
}
