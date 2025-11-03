export interface AuthRequest {
    username: string;
    password: string;
}

export type RegisterRequest = {
    username: string;
    email?: string;
    password: string;
    isParent: boolean;
    birthDate?: string;
    parentUsername?: string;
    avatarUrl?: string;
    role?: 'ROLE_PARENT' | 'ROLE_CHILD';
};

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
}
