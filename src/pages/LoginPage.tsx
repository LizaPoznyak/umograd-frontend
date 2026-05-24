import { useEffect, useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import "../components/Layout.css";
import "../styles/LoginPage.css";
import Loader from "../components/Loader.tsx";
import { useUser } from "../context/UserContext";
import { fetchProfile } from "../api/user";
import { parseJwt } from "../utils/jwt";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { setProfile } = useUser();

    useEffect(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await login({ username, password });
            const { accessToken, refreshToken, userId } = response;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            if (userId) {
                localStorage.setItem("childId", userId.toString());
            } else {
                const payload = parseJwt(accessToken);
                if (payload && payload.sub) {
                    localStorage.setItem("childId", payload.sub.toString());
                }
            }

            const apiProfile = await fetchProfile();
            setProfile(apiProfile);

            if (apiProfile.roles.includes("ROLE_MODERATOR")) {
                navigate("/users");
            } else if (apiProfile.roles.includes("ROLE_PARENT")) {
                navigate("/children");
            } else if (apiProfile.roles.includes("ROLE_CHILD")) {
                navigate("/child");
            } else {
                navigate("/");
            }
        } catch (err: any) {
            console.error(err);
            if (err?.response?.data?.error) {
                alert(err.response.data.error);
            } else if (err?.message) {
                alert(err.message);
            } else {
                alert("Ошибка входа");
            }
        } finally {
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
                        {/*<div className="login-forgo-container">
                        </div>*/}
                        <div className="login-actions">
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? "Вход..." : "Войти"}
                            </button>
                            <a href="/register" className="login-register">Регистрация</a>
                        </div>
                    </form>
                    {loading && <Loader />}
                </div>
            </main>
            <Footer />
        </div>
    );
}
