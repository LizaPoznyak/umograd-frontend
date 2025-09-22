import { useState } from "react";
import { register } from "../api/auth";
import Alert from "../components/Alert";
import Loader from "../components/Loader";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
        <div>
            <h2>Регистрация</h2>

            {loading && <Loader />}
            <Alert type="error" message={error} />
            <Alert type="success" message={success} />

            <form onSubmit={handleRegister} style={{ marginTop: "1rem" }}>
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
            </form>
        </div>
    );
}
