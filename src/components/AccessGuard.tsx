import {type JSX, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

export default function AccessGuard({ children }: { children: JSX.Element }) {
    const [granted, setGranted] = useState<boolean | null>(null);
    const [reason, setReason] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const userId = localStorage.getItem("childId");
            const token = localStorage.getItem("accessToken");

            if (!userId || !token) {
                setGranted(false);
                setReason("Пользователь не авторизован");
                return;
            }

            try {
                const res = await fetch(`http://localhost:8182/api/v1/analytics/access/check/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.granted) {
                        setGranted(true);
                    } else {
                        setGranted(false);
                        setReason(data.message);
                    }
                } else {
                    setGranted(false);
                    setReason("Ошибка при проверке прав доступа");
                }
            } catch (err) {
                setGranted(false);
                setReason("Сервис аналитики временно недоступен");
            }
        };
        verify();
    }, []);

    if (granted === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loader">Загрузка доступа...</div>
            </div>
        );
    }

    if (!granted) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                padding: '20px',
                fontFamily: 'inherit'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    maxWidth: '450px',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
                    <h2 style={{
                        color: '#2d3748',
                        marginBottom: '15px',
                        fontSize: '24px',
                        fontWeight: '700'
                    }}>
                        Доступ ограничен
                    </h2>
                    <p style={{
                        color: '#718096',
                        lineHeight: '1.6',
                        marginBottom: '30px',
                        fontSize: '16px'
                    }}>
                        {reason}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate("/child")}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#4A90E2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
