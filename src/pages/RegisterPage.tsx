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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isParent, setIsParent] = useState(true);
    const [age, setAge] = useState("");

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

            const tokens = await register({ username, email, password });
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);

            setSuccess("Регистрация успешна!");
            setUsername("");
            setEmail("");
            setPassword("");

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(err);
            setError("Ошибка регистрации");
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
                            //value={avatar}
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
                            /*value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required*/
                        />
                        {!isParent && (
                            <input
                                type="number"
                                placeholder="Возраст"
                                className="register-input"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                            />
                        )}
                        <label className="register-checkbox">
                            <input
                                type="checkbox"
                                checked={isParent}
                                onChange={(e) => setIsParent(e.target.checked)}
                                /*value={parent_role}
                                onChange={(e) => setRole(e.target.value)}*/
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
