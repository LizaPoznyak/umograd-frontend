import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            const tokens = await login({ username, password });
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);

            // Декодируем accessToken, чтобы узнать роли
            const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
            const roles: string[] = payload.roles || [];

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
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <h2>Вход</h2>
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}
