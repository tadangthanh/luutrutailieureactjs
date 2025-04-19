import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        // Chuyển hướng đến endpoint Google OAuth backend
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Đăng ký</h2>
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
                        Đăng ký
                    </button>
                </form>

                <div className="my-4 text-center text-gray-500">hoặc</div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full border py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-center items-center gap-2"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Đăng nhập với Google
                </button>          
            </div>
        </div>
    );
};

export default RegisterPage;
