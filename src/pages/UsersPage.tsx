import { useEffect, useState } from "react";
import { getUsers, deleteUser, changeRole } from "../api/users";
import type { UserResponse } from "../types/user";
import Alert from "../components/Alert";
import Loader from "../components/Loader";

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
        <div>
            <h2>Управление пользователями</h2>

            {loading && <Loader />}
            <Alert type="error" message={error} />
            <Alert type="success" message={success} />

            {!loading && !error && (
                <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Логин</th>
                        <th>Email</th>
                        <th>Роли</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.roles.join(", ")}</td>
                            <td>
                                <button onClick={() => handleDelete(u.id)}>Удалить</button>
                                {!u.roles.includes("ROLE_PARENT") && (
                                    <button onClick={() => handleChangeRole(u.id, "ROLE_PARENT")}>
                                        Сделать родителем
                                    </button>
                                )}
                                {!u.roles.includes("ROLE_MODERATOR") && (
                                    <button onClick={() => handleChangeRole(u.id, "ROLE_MODERATOR")}>
                                        Сделать модератором
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
