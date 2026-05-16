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
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                const tokenProfile = getProfileFromToken();
                if (tokenProfile) {
                    setProfile(tokenProfile);
                }
            } catch (tokenErr) {
                console.warn(tokenErr);
            }

            const apiProfile = await fetchProfile();
            setProfile(apiProfile);
        } catch (e) {
            console.error("Не удалось загрузить профиль с сервера", e);
            setProfile(null);
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
