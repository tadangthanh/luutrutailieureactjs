import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { Settings, Upload } from "lucide-react";

interface HeaderProps {
    activeMenu: string;
}

export const Header: React.FC<HeaderProps> = ({ activeMenu }) => {
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const avatarUrl = localStorage.getItem("avatarUrl");
    const isLoggedIn = !!localStorage.getItem("accessToken");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("avatarUrl");
        window.location.href = "/login";
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                {activeMenu}
            </h1>

            <div className="flex items-center gap-4">
                <button className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-2xl transition flex items-center gap-2">
                    <Upload size={16} />
                    Tải lên
                </button>


                <button className="bg-neutral-light dark:bg-neutral-dark hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium px-4 py-2 rounded-2xl transition">
                    Tạo thư mục
                </button>

                <Dropdown
                    trigger={
                        isLoggedIn ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer">
                                {avatarUrl && avatarUrl !== "null" ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <Settings className="w-6 h-6 text-gray-800 dark:text-white" />
                                )}
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                    {fullName || email}
                                </span>
                            </div>
                        ) : (
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium transition">
                                👤 Tài khoản
                            </button>
                        )
                    }
                >
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </Dropdown>
            </div>
        </header>
    );
};
