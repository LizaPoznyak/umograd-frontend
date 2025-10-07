export interface AuthRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: "ROLE_PARENT" | "ROLE_MODERATOR" | "ROLE_CHILD";
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
}
