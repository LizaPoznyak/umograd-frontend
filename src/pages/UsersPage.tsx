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

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                <div className="admin-header">
                    <h2>Управление пользователями</h2>
                    <button className="nav-tasks-btn" onClick={() => navigate("/tasks-admin")}>
                        К списку заданий
                    </button>
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
                                        <button className="btn-delete" onClick={() => handleDelete(u.id)}>
                                            Удалить
                                        </button>
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
