import axios from "axios";
import type { AuthRequest, AuthResponse, RegisterRequest } from "../types/auth";

const API_URL = "http://localhost:8080/api/v1/auth";

export async function login(data: AuthRequest): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>(`${API_URL}/login`, data);
    return res.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>(`${API_URL}/register`, data);
    return res.data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>(`${API_URL}/refresh`, { refreshToken });
    return res.data;
}
