import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// === Kiểu dữ liệu cho response từ backend ===
interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    fullName: string;
    email: string;
    avatarUrl: string;
}

// === Mở rộng AxiosRequestConfig để thêm _retry flag ===
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
    _retry?: boolean;
}

// === Kiểu cho request bị delay khi đang refresh ===
interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_V1,
    withCredentials: true,
});

// === Gắn accessToken vào header ===
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === Tự động refresh token khi hết hạn ===

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else if (token) resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfigWithRetry;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                window.location.href = "/login";
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                const res = await axios.post<TokenResponse>(
                    `${process.env.REACT_APP_BASE_API_V1}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                );

                const { accessToken, refreshToken: newRefreshToken } = res.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", newRefreshToken);

                processQueue(null, accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
