import axios from "axios";
import type { AuthRequest, AuthResponse, RegisterRequest } from "../types/auth";

const API_URL = "http://localhost:8080/api/v1/auth";

export async function login(data: AuthRequest): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>(`${API_URL}/login`, data);
    return res.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>(`${API_URL}/refresh`, { refreshToken });
    return res.data;
}

export type Tokens = {
    accessToken: string;
    refreshToken: string;
    userId: number;
};

export async function register(payload: RegisterRequest): Promise<Tokens> {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Registration failed');
    }
    return res.json();
}
