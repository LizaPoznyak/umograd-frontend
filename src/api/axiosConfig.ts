import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

// Подставляем accessToken в каждый запрос
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватываем ошибки и обновляем токен при 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("Нет refresh токена");

                const res = await axios.post(
                    `http://localhost:8080/api/v1/auth/refresh?refreshToken=${refreshToken}`
                );

                const { accessToken, refreshToken: newRefresh } = res.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", newRefresh);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (e) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
