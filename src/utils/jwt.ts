import type { UserProfile } from "../types/user";

/**
 * Декодирует JWT payload с поддержкой UTF-8 (кириллица и др. символы).
 */
function parseJwt(token: string): any | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const jsonPayload = new TextDecoder("utf-8").decode(bytes);

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Ошибка парсинга токена:", e);
        return null;
    }
}

/**
 * Достаёт профиль пользователя из accessToken в localStorage.
 */
export function getProfileFromToken(): UserProfile | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payload = parseJwt(token);
    if (!payload) return null;

    return {
        id: payload.sub ? Number(payload.sub) : 0,
        username: payload.username ?? "",
        email: payload.email ?? null,
        roles: payload.roles ?? [],
        birthDate: payload.birthDate ?? null,
        avatarUrl: payload.avatarUrl ?? null,
    };
}
