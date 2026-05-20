import api from "./axiosConfig";
import type {AuthResponse, RegisterRequest } from "../types/auth";
import axios from "axios";

const API_URL = "/auth";
export async function login(credentials: any) {
    try {
        const response = await axios.post("http://localhost:8080/api/v1/auth/login", credentials);

        if (response.data && response.data.error) {
            throw new Error(response.data.error);
        }

        return response.data;
    } catch (error: any) {
        if (error.message && error.message.includes("Вход заблокирован")) {
            throw error;
        }
        if (error.response && error.response.data) {
            throw new Error(error.response.data.error || "Ошибка авторизации");
        }
        throw new Error("Не удалось связаться с сервером");
    }
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
