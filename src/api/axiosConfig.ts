import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

// Подставляем accessToken в каждый запрос
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        // Для отладки можно оставить, но лучше убрать в продакшене
        console.log("JWT payload:", JSON.parse(atob(token.split(".")[1])));
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватываем ошибки
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если токен истёк и мы ещё не пробовали обновить
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("Нет refresh токена");

                // Запрос на обновление (через query‑параметр, как у тебя в контроллере)
                const res = await axios.post(
                    `http://localhost:8080/api/v1/auth/refresh?refreshToken=${refreshToken}`
                );

                const { accessToken, refreshToken: newRefresh } = res.data;

                // Сохраняем новые токены
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", newRefresh);

                // Обновляем username и роли из нового accessToken
                const payload = JSON.parse(atob(accessToken.split(".")[1]));
                if (payload.username) {
                    localStorage.setItem("username", payload.username);
                }
                if (payload.roles) {
                    localStorage.setItem("roles", JSON.stringify(payload.roles));
                }

                // Подставляем новый токен и повторяем запрос
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (_error) {
                // Если refresh не удался → разлогиниваем
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
