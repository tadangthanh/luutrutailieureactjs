import axios from "axios";

// Tạo một instance Axios
const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_V1,
    withCredentials: true, // Cho phép gửi cookie (nếu có)
});

// Gắn accessToken tự động vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý lỗi chung (nếu muốn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ví dụ: nếu token hết hạn, có thể redirect về login
        if (error.response?.status === 401) {
            console.warn("Unauthorized! Redirecting to login...");
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
