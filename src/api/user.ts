import api from "./axiosConfig";
import type { UserProfile } from "../types/user";

interface UpdateUserProfileResponse {
    profile: UserProfile;
    accessToken: string;
    refreshToken: string;
}

export async function updateProfile(data: any): Promise<UpdateUserProfileResponse> {
    const res = await api.put<UpdateUserProfileResponse>("/users/me", data);
    return res.data;
}

export async function fetchProfile(): Promise<UserProfile> {
    const res = await api.get<UserProfile>("/users/me");
    return res.data;
}
