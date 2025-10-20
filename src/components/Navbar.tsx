import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import avatar from "../assets/avatar.png";
import bellIcon from "../assets/notif.png";
import menuDots from "../assets/menu.png";
import closeIcon from "../assets/close.png"; // твой крестик без фона
import "./Navbar.css";
import {useEffect, useRef, useState} from "react";

function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const jsonPayload = new TextDecoder().decode(bytes);
    return JSON.parse(jsonPayload);
}

export default function Navbar() {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                notifRef.current &&
                !notifRef.current.contains(event.target as Node) &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowNotif(false);
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            username = payload.username;
            roles = payload.roles || [];
        } catch {
            username = "";
        }
    }

    let homePath = "/";
    if (roles.includes("ROLE_MODERATOR")) homePath = "/users";
    else if (roles.includes("ROLE_PARENT")) homePath = "/children";
    else if (roles.includes("ROLE_CHILD")) homePath = "/child";

    return (
        <header className="navbar">
            <div className="navigation">
                {/* Логотип слева */}
                <div className="navbar-left">
                    <NavLink to={homePath} className="logo-circle">
                        <img src={logo} alt="Umograd" className="logo" />
                    </NavLink>
                </div>

                {/* Центр — навигация */}
                <nav className="navbar-center">
                    <NavLink to={homePath} className="nav-item">Главная</NavLink>
                    <NavLink to="/tasks" className="nav-item">Задания</NavLink>
                    <NavLink to="/achievements" className="nav-item">Достижения</NavLink>
                </nav>
            </div>

            <span className="brand">Умоград</span>

            {/* Правая часть */}
            <div className="navbar-right">
                {/* Уведомления */}
                <div
                    ref={notifRef}
                    className={`notif-block ${showNotif ? "active" : ""}`}
                    onClick={() => {
                        setShowNotif(!showNotif);
                        setShowMenu(false); // закрываем меню, если открыто
                    }}
                >
                    <img src={bellIcon} alt="Уведомления" className="notif-icon"/>
                    <span className="notif-text">Уведомления</span>
                    {showNotif && (
                        <div className="dropdown dropdown-notif">
                            <div className="notif-item">
                                <span>Уведомление 1</span>
                                <button className="notif-close">
                                    <img src={closeIcon} alt="Закрыть" />
                                </button>
                            </div>
                            <div className="notif-item">
                                <span>Уведомление 2</span>
                                <button className="notif-close">
                                    <img src={closeIcon} alt="Закрыть" />
                                </button>
                            </div>
                            <div className="notif-item">
                                <span>Уведомление 3</span>
                                <button className="notif-close">
                                    <img src={closeIcon} alt="Закрыть" />
                                </button>
                            </div>
                            <div className="notif-item">
                                <span>Уведомление 4</span>
                                <button className="notif-close">
                                    <img src={closeIcon} alt="Закрыть" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Профиль */}
                {username && (
                    <div
                        className="profile-block"
                        onClick={() => navigate("/profile")}
                    >
                        <img src={avatar} alt="avatar" className="avatar"/>
                        <span className="username">{username}</span>
                    </div>
                )}

                {/* Меню */}
                <div ref={menuRef} className="menu-wrapper">
                    <button
                        onClick={() => {
                            setShowMenu(!showMenu);
                            setShowNotif(false); // закрываем уведомления, если открыты
                        }}
                        className={`logout-circle ${showMenu ? "active" : ""}`}
                    >
                        <img src={menuDots} alt="Меню" className="menu-icon"/>
                    </button>
                    {showMenu && (
                        <div className="dropdown dropdown-menu">
                            <button onClick={handleLogout} className="dropdown-item">
                                Выйти
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                          d="M7.125 4.15625C7.125 3.99878 7.18756 3.84776 7.29891 3.73641C7.41026 3.62506 7.56128 3.5625 7.71875 3.5625H17.2188C17.3762 3.5625 17.5272 3.62506 17.6386 3.73641C17.7499 3.84776 17.8125 3.99878 17.8125 4.15625V14.8438C17.8125 15.0012 17.7499 15.1522 17.6386 15.2636C17.5272 15.3749 17.3762 15.4375 17.2188 15.4375H7.71875C7.56128 15.4375 7.41026 15.3749 7.29891 15.2636C7.18756 15.1522 7.125 15.0012 7.125 14.8438V12.4688C7.125 12.3113 7.06244 12.1603 6.95109 12.0489C6.83974 11.9376 6.68872 11.875 6.53125 11.875C6.37378 11.875 6.22276 11.9376 6.11141 12.0489C6.00006 12.1603 5.9375 12.3113 5.9375 12.4688V14.8438C5.9375 15.3162 6.12517 15.7692 6.45922 16.1033C6.79326 16.4373 7.24633 16.625 7.71875 16.625H17.2188C17.6912 16.625 18.1442 16.4373 18.4783 16.1033C18.8123 15.7692 19 15.3162 19 14.8438V4.15625C19 3.68383 18.8123 3.23077 18.4783 2.89672C18.1442 2.56267 17.6912 2.375 17.2188 2.375H7.71875C7.24633 2.375 6.79326 2.56267 6.45922 2.89672C6.12517 3.23077 5.9375 3.68383 5.9375 4.15625V6.53125C5.9375 6.68872 6.00006 6.83974 6.11141 6.95109C6.22276 7.06244 6.37378 7.125 6.53125 7.125C6.68872 7.125 6.83974 7.06244 6.95109 6.95109C7.06244 6.83974 7.125 6.68872 7.125 6.53125V4.15625Z"
                                          fill="#FF7F82"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                          d="M14.0756 10.4203C14.1309 10.3651 14.1747 10.2996 14.2047 10.2275C14.2346 10.1553 14.25 10.078 14.25 9.99992C14.25 9.92183 14.2346 9.84451 14.2047 9.77238C14.1747 9.70025 14.1309 9.63473 14.0756 9.57958L10.5134 6.01737C10.4582 5.96217 10.3926 5.91839 10.3205 5.88851C10.2484 5.85864 10.1711 5.84326 10.093 5.84326C10.015 5.84326 9.93766 5.85864 9.86554 5.88851C9.79342 5.91839 9.72789 5.96217 9.67269 6.01737C9.61749 6.07257 9.5737 6.1381 9.54383 6.21023C9.51395 6.28235 9.49857 6.35965 9.49857 6.43771C9.49857 6.51578 9.51395 6.59308 9.54383 6.6652C9.5737 6.73732 9.61749 6.80285 9.67269 6.85805L12.222 9.40622H1.7812C1.62374 9.40622 1.47273 9.46877 1.36139 9.58011C1.25005 9.69145 1.1875 9.84246 1.1875 9.99992C1.1875 10.1574 1.25005 10.3084 1.36139 10.4197C1.47273 10.5311 1.62374 10.5936 1.7812 10.5936H12.222L9.67269 13.1418C9.61749 13.197 9.5737 13.2625 9.54383 13.3346C9.51395 13.4068 9.49857 13.4841 9.49857 13.5621C9.49857 13.6402 9.51395 13.7175 9.54383 13.7896C9.5737 13.8617 9.61749 13.9273 9.67269 13.9825C9.72789 14.0377 9.79342 14.0815 9.86554 14.1113C9.93766 14.1412 10.015 14.1566 10.093 14.1566C10.1711 14.1566 10.2484 14.1412 10.3205 14.1113C10.3926 14.0815 10.4582 14.0377 10.5134 13.9825L14.0756 10.4203Z"
                                          fill="#FF7F82"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}