import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser, changeRole } from "../api/users";
import type { UserResponse } from "../types/user";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Users.css";

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (e) {
            setError("Не удалось загрузить пользователей");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Удалить пользователя?")) return;
        try {
            await deleteUser(id);
            setSuccess("Пользователь удалён");
            setTimeout(() => setSuccess(null), 3000);
            loadUsers();
        } catch {
            setError("Ошибка при удалении пользователя");
            setTimeout(() => setError(null), 3000);
        }
    }

    async function handleChangeRole(id: number, role: string) {
        try {
            await changeRole(id, role);
            setSuccess("Роль пользователя обновлена");
            setTimeout(() => setSuccess(null), 3000);
            loadUsers();
        } catch {
            setError("Ошибка при смене роли");
            setTimeout(() => setError(null), 3000);
        }
    }

    async function handleBlock(id: number, username: string) {
        if (!window.confirm(`Заблокировать пользователя ${username}?`)) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8181/users/${id}/block`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setSuccess(`Пользователь ${username} заблокирован`);
                setTimeout(() => setSuccess(null), 3000);
                loadUsers();
            } else {
                setError("Ошибка при блокировке на сервере");
                setTimeout(() => setError(null), 3000);
            }
        } catch {
            setError("Ошибка связи с сервером");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <h2>Управление пользователями</h2>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            className="nav-tasks-btn"
                            style={{ background: "linear-gradient(90deg, #689ECA 0%, #8FDADB 100%)", color: "white", border: "none" }}
                            onClick={() => navigate("/monitoring")}
                        >
                            🖥️ Журнал сессий
                        </button>
                    </div>
                </div>

                <Alert type="error" message={error} />
                <Alert type="success" message={success} />

                {loading ? (
                    <Loader />
                ) : (
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Email</th>
                                <th>Текущие роли</th>
                                <th>Изменить роль</th>
                                <th>Действие</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td><strong>{u.username}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.roles.map(role => (
                                            <span key={role} className={`role-badge ${role.toLowerCase()}`}>
                                                    {role.replace("ROLE_", "")}
                                                </span>
                                        ))}
                                    </td>
                                    <td>
                                        <div className="role-actions">
                                            {!u.roles.includes("ROLE_PARENT") && (
                                                <button className="btn-role parent" onClick={() => handleChangeRole(u.id, "ROLE_PARENT")}>
                                                    Родитель
                                                </button>
                                            )}
                                            {!u.roles.includes("ROLE_MODERATOR") && (
                                                <button className="btn-role mod" onClick={() => handleChangeRole(u.id, "ROLE_MODERATOR")}>
                                                    Модератор
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                            <button
                                                className="btn-delete"
                                                style={{ backgroundColor: "#ffc9c9", color: "#fa5252" }}
                                                onClick={() => handleBlock(u.id, u.username)}
                                            >
                                                Бан
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(u.id)}>
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
