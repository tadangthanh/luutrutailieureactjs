import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
    const baseApi = process.env.REACT_APP_BASE_API;
    const navigate = useNavigate();
    const handleLoginSuccessGoogle = async (credentialResponse: any) => {
        try {
            const res = await axios.post(baseApi + '/auth/google', {
                token: credentialResponse.credential // Gửi nguyên token
            }, {
                withCredentials: true, // nhận cookie từ backend nếu cần
            });
            const { accessToken, refreshToken, fullName, email, avatarUrl } = res.data;

            // Lưu vào localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("fullName", fullName);  // Lưu tên người dùng
            localStorage.setItem("email", email); // Lưu email người dùng
            localStorage.setItem("avatarUrl", avatarUrl); // Lưu avatar
            toast.success("Đăng nhập thành công!", { position: "top-right" }); // ✅ Thông báo thành công

            setTimeout(() => {
                window.location.href = "http://localhost:3000";
            }, 1000); // delay 1 chút để người dùng thấy thông báo
        } catch (err) {
            toast.error("Đăng nhập thất bại. Vui lòng thử lại!", { position: "top-right" }); // ✅ Thông báo lỗi
        }
    };
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleLoginOriginal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Vui lòng nhập đầy đủ email và mật khẩu.", { position: "top-right" });
            return;
        }

        try {
            const res = await axios.post(`${baseApi}/auth/access`, { email, password }, {
                withCredentials: true,
            });
            if(res.data.status===200){
                toast.success(res.data.message, { position: "top-right" });
                const { accessToken, refreshToken, fullName, avatarUrl } = res.data.data;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("fullName", fullName);
                localStorage.setItem("email", email);
                localStorage.setItem("avatarUrl", avatarUrl);
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
                return
            }
            toast.error(res.data.message, { position: "top-right" });
        } catch (err: any) {
            toast.error(err.message, { position: "top-right" });
            console.error("Lỗi đăng nhập:", err);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Đăng nhập</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Mật khẩu</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button onClick={(e: any) => handleLoginOriginal(e)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Đăng nhập
                    </button>
                </form>

                <div className="my-4 text-center text-gray-500">hoặc</div>

                <GoogleLogin
                    onSuccess={handleLoginSuccessGoogle}
                    onError={() => toast.error("Đăng nhập thất bại. Vui lòng thử lại!", { position: "top-right" })} // ✅ Thông báo lỗi
                />

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer select-none"
                    >
                        Đăng ký
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
