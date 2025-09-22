import api from "./axiosConfig";
import type { UserResponse } from "../types/user";

// Получить всех пользователей
export async function getUsers(): Promise<UserResponse[]> {
    const res = await api.get<UserResponse[]>("/moderator/users");
    return res.data;
}

// Удалить пользователя
export async function deleteUser(id: number): Promise<void> {
    await api.delete(`/moderator/users/${id}`);
}

// Сменить роль пользователя (PUT вместо PATCH!)
export async function changeRole(id: number, role: string): Promise<UserResponse> {
    const res = await api.put<UserResponse>(`/moderator/users/${id}/role`, { role });
    return res.data;
}
