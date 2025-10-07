import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const jsonPayload = new TextDecoder().decode(bytes);
    return JSON.parse(jsonPayload);
}

export default function Navbar() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    }

    const token = localStorage.getItem("accessToken");
    let username = "";
    let roles: string[] = [];
    if (token) {
        try {
            const payload = parseJwt(token);

            // 👇 теперь sub = id, а имя лежит в username
            username = payload.username;
            roles = payload.roles || [];
        } catch {
            username = "";
        }
    }

    // Определяем главную страницу в зависимости от роли
    let homePath = "/";
    if (roles.includes("ROLE_MODERATOR")) {
        homePath = "/users";
    } else if (roles.includes("ROLE_PARENT")) {
        homePath = "/children";
    } else if (roles.includes("ROLE_CHILD")) {
        homePath = "/child";
    }

    return (
        <header className="navbar">
            <div className="navbar-left">
                <Link to={homePath} className="logo-link">
                    <img src={logo} alt="Umograd" className="logo" />
                </Link>
            </div>

            <nav className="navbar-center">
                <Link to={homePath} className="nav-link">Главная</Link>
                {roles.includes("ROLE_PARENT") && (
                    <Link to="/children" className="nav-link">Дети</Link>
                )}
                {roles.includes("ROLE_MODERATOR") && (
                    <Link to="/users" className="nav-link">Пользователи</Link>
                )}
                {roles.includes("ROLE_CHILD") && (
                    <Link to="/child" className="nav-link">Моя страница</Link>
                )}
                <Link to="/tasks" className="nav-link">Задания</Link>
            </nav>

            <div className="navbar-right">
                {username && (
                    <Link to="/profile" className="username-link">
                        {username}
                    </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                    Выйти
                </button>
            </div>
        </header>
    );
}
