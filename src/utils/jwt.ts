import type { UserProfile } from "../types/user";

export function parseJwt(token: string): any | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;

        let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padLen = (4 - (base64.length % 4)) % 4;
        base64 += "=".repeat(padLen);

        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const jsonPayload = new TextDecoder("utf-8").decode(bytes);

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Ошибка парсинга токена:", e);
        return null;
    }
}

export function getProfileFromToken(): UserProfile | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payload = parseJwt(token);
    if (!payload) return null;

    return {
        id: payload.sub ? Number(payload.sub) : 0,
        username: payload.username ?? "",
        email: payload.email ?? undefined,
        roles: payload.roles ?? [],
        birthDate: payload.birthDate ?? undefined, // 👈 И здесь тоже
        avatarUrl: payload.avatarUrl ?? undefined, // 👈 И здесь тоже
    };
}
