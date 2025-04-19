import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const baseApiV1 = process.env.REACT_APP_BASE_API_V1;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Mật khẩu và xác nhận mật khẩu không khớp");
            return;
        }

        const userRegister = {
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };
        try {
            const res = await axios.post(`${baseApiV1}/user/register`, userRegister);
            console.log("res", res);
            console.log("res.data", res.data);
            if (res.data.status === 201) {
                toast.success(res.data.message, { position: "top-right" });
                setTimeout(() => {
                    navigate("/login");
                }, 1000); // delay 1 chút để người dùng thấy thông báo
            } else {
                toast.error(res.data.message, { position: "top-right" });
            }
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
        }
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Đăng ký</h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center bg-red-100 dark:bg-red-200 px-4 py-2 rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Đăng ký
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Đã có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer select-none"
                    >
                        Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
