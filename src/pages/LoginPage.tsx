import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const LoginPage = () => {
    const handleLoginSuccess = async (credentialResponse: any) => {
        const idToken = credentialResponse.credential;

        try {
            // Gửi ID token đến backend để xác minh và nhận access token từ hệ thống bạn
            const res = await axios.post('http://localhost:8080/login/oauth2/code/google', {
                idToken,
            });

            // Lưu token backend trả về (JWT hoặc gì đó)
            localStorage.setItem('token', res.data.token);

            // Redirect qua trang chính
            window.location.href = "/";
        } catch (err) {
            console.error('Login failed', err);
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
                            type="email"
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Đăng nhập
                    </button>
                </form>

                <div className="my-4 text-center text-gray-500">hoặc</div>

                <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản?{" "}
                    <a
                        href="/register"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Đăng ký
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
