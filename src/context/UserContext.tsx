import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "../types/user";
import { getProfileFromToken } from "../utils/jwt";
import { fetchProfile } from "../api/user";

interface UserContextType {
    profile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    setProfile: (p: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType>({
    profile: null,
    loading: true,
    refreshProfile: async () => {},
    setProfile: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    async function refreshProfile() {
        setLoading(true);
        try {
            // быстрый вариант из токена
            const tokenProfile = getProfileFromToken();
            if (tokenProfile) setProfile(tokenProfile);

            // авторитетный вариант с бэка (с аватаром)
            const apiProfile = await fetchProfile();
            setProfile(apiProfile);
        } catch (e) {
            console.error("Не удалось загрузить профиль с сервера", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshProfile();
    }, []);

    return (
        <UserContext.Provider value={{ profile, loading, refreshProfile, setProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
