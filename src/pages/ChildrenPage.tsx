import { useEffect, useState } from "react";
import { getChildren, addChild, deleteChild } from "../api/children";
import type { ChildResponse } from "../types/user";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import "../components/Layout.css";

export default function ChildrenPage() {
    const [children, setChildren] = useState<ChildResponse[]>([]);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadChildren();
    }, []);

    async function loadChildren() {
        try {
            setLoading(true);
            const data = await getChildren();
            setChildren(data);
        } catch {
            setError("Не удалось загрузить список детей");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            await addChild(username, email, password);
            setUsername("");
            setEmail("");
            setPassword("");
            setSuccess("Ребёнок успешно добавлен");
            setTimeout(() => setSuccess(null), 3000);
            loadChildren();
        } catch {
            setError("Ошибка при добавлении ребёнка");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Удалить ребёнка?")) return;
        try {
            setLoading(true);
            await deleteChild(id);
            setSuccess("Ребёнок удалён");
            setTimeout(() => setSuccess(null), 3000);
            loadChildren();
        } catch {
            setError("Ошибка при удалении ребёнка");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <Navbar/>
            <main className="app-main">
                <div>
                    <h2>Мои дети</h2>

                    {loading && <Loader/>}
                    <Alert type="error" message={error}/>
                    <Alert type="success" message={success}/>

                    <form onSubmit={handleAdd} style={{marginBottom: "1rem"}}>
                        <input
                            type="text"
                            placeholder="Логин ребёнка"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email ребёнка"
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
                        <button type="submit">Добавить ребёнка</button>
                    </form>

                    {!loading && !error && (
                        <table border={1} cellPadding={5} style={{borderCollapse: "collapse"}}>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Email</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {children.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.username}</td>
                                    <td>{c.email}</td>
                                    <td>
                                        <button onClick={() => handleDelete(c.id)}>Удалить</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

