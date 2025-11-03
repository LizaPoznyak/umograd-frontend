import axios from "axios";
import type { UserProfile } from "../types/user";

interface UpdateUserProfileResponse {
    profile: UserProfile;
    accessToken: string;
    refreshToken: string;
}

export async function updateProfile(data: any): Promise<UpdateUserProfileResponse> {
    const res = await axios.put<UpdateUserProfileResponse>("http://localhost:8080/api/v1/users/me", data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return res.data;
}

export async function fetchProfile(): Promise<UserProfile> {
    const res = await axios.get<UserProfile>("http://localhost:8080/api/v1/users/me", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return res.data;
}
