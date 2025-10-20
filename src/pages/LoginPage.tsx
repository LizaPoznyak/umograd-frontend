import { useState } from "react";
import { login } from "../api/auth";
import {useNavigate} from "react-router-dom";
import Footer from "../components/Footer.tsx";
import "../components/Layout.css";
import "../styles/LoginPage.css";
import Loader from "../components/Loader.tsx";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await login({ username, password });
            const { accessToken, refreshToken, userId } = response;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            // если бэк вернул userId → сохраняем
            if (userId) {
                localStorage.setItem("childId", userId.toString());
            } else {
                // иначе достаём из токена
                const payload = JSON.parse(atob(accessToken.split(".")[1]));
                if (payload.sub) {
                    localStorage.setItem("childId", payload.sub.toString());
                }
            }

            // роли и имя пользователя из токена
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            const roles: string[] = payload.roles || [];
            const usernameFromToken: string = payload.username;

            localStorage.setItem("username", usernameFromToken);

            // редирект по роли
            if (roles.includes("ROLE_MODERATOR")) {
                navigate("/users");
            } else if (roles.includes("ROLE_PARENT")) {
                navigate("/children");
            } else if (roles.includes("ROLE_CHILD")) {
                navigate("/child");
            } else {
                alert("Неизвестная роль, остаёмся на странице входа");
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка входа");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <main className="app-main">
                <h2 className="login-title">Вход</h2>
                <div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-fields">
                            <input
                                type="text"
                                placeholder="Логин"
                                className="login-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Пароль"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-forgo-container">
                            <a href="#" className="login-forgot">Забыли пароль?</a>
                        </div>
                        <div className="login-actions">
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? "Вход..." : "Войти"}
                            </button>
                            <a href="/register" className="login-register">Регистрация</a>
                        </div>
                    </form>
                    {loading && <Loader/>}
                </div>
            </main>
            <Footer/>
        </div>
    );
}
