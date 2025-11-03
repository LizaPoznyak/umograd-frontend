import api from "./axiosConfig";
import type { AuthRequest, AuthResponse, RegisterRequest } from "../types/auth";

const API_URL = "/auth";

export async function login(data: AuthRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(`${API_URL}/login`, data);
    return res.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(`${API_URL}/refresh`, null, {
        params: { refreshToken },
    });
    return res.data;
}

export async function register(payload: RegisterRequest) {
    const res = await api.post(`${API_URL}/register`, payload);
    return res.data;
}
