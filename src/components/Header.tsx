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
        <header className="bg-white dark:bg-gray-800 shadow-lg px-8 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300 tracking-tight">
                {activeMenu}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <Upload size={18} />
                    Tải lên
                </button>

                <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <FolderPlus size={18} />
                    Tạo thư mục
                </button>

                <Dropdown
                    trigger={
                        isLoggedIn ? (
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-600 shadow-sm">
                                {avatarUrl && avatarUrl !== "null" ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                                <span className="text-base font-medium text-gray-800 dark:text-white">
                                    {fullName || email}
                                </span>
                            </div>
                        ) : (
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-base font-medium transition-all duration-200 shadow-sm">
                                👤 Tài khoản
                            </button>
                        )
                    }
                >
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-white transition-colors duration-200"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-white transition-colors duration-200"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-white transition-colors duration-200"
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
