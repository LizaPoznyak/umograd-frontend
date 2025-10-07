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
