export interface UserResponse {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface ChildResponse {
    id: number;
    username: string;
    email: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string | null;
    roles: string[];
    birthDate: string | null;
    avatarUrl: string | null;
}
