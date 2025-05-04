import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { Settings, Upload, FolderPlus } from "lucide-react";

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
        <header className="bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 z-30">
            <h1 className="text-2xl font-extrabold text-primary dark:text-white tracking-tight">
                {activeMenu}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-xl shadow transition-all duration-200">
                    <Upload size={18} />
                    Tải lên
                </button>

                <button className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-semibold px-4 py-2 rounded-xl shadow transition-all duration-200">
                    <FolderPlus size={18} />
                    Tạo thư mục
                </button>

                <Dropdown
                    trigger={
                        isLoggedIn ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer border border-gray-200 dark:border-gray-600">
                                {avatarUrl && avatarUrl !== "null" ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                                    />
                                ) : (
                                    <Settings className="w-7 h-7 text-gray-800 dark:text-white" />
                                )}
                                <span className="text-base font-semibold text-gray-800 dark:text-white">
                                    {fullName || email}
                                </span>
                            </div>
                        ) : (
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-base font-semibold transition">
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
