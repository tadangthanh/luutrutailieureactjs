
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { Settings } from "lucide-react";

const Header = () => {
    // Lấy thông tin người dùng từ localStorage
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const avatarUrl = localStorage.getItem("avatarUrl");
    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = !!localStorage.getItem("accessToken");
    const handleLogout = () => {
        // Xoá token và thông tin người dùng khỏi localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("avatarUrl");

        // Điều hướng về trang đăng nhập
        window.location.href = "/login";
    };
    return (
        <header className="bg-white dark:bg-gray-800 shadow px-4 py-2 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Tài liệu của tôi</h1>

            <div className="flex items-center gap-3">
                <button className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark">
                    Tải lên
                </button>
                <button className="bg-neutral-light dark:bg-neutral-dark px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                    Tạo thư mục
                </button>

                <Dropdown
                    trigger={
                        isLoggedIn ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                                {avatarUrl && avatarUrl !== "null" && avatarUrl !== "" ? (
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <Settings className="w-8 h-8 text-gray-800 dark:text-white" />
                                )}
                                <span className="text-sm">{fullName || email}</span>
                            </div>
                        ) : (
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                                👤 Tài khoản
                            </button>
                        )
                    }
                >
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
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

export default Header;