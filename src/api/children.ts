import api from "./axiosConfig";
import type { ChildResponse } from "../types/user";

export async function getChildren(): Promise<ChildResponse[]> {
    const res = await api.get<ChildResponse[]>("/parent/children");
    return res.data;
}

export async function addChild(username: string, email: string, password: string): Promise<ChildResponse> {
    const res = await api.post<ChildResponse>("/parent/children", { username, email, password });
    return res.data;
}

export async function deleteChild(id: number): Promise<void> {
    await api.delete(`/parent/children/${id}`);
}
