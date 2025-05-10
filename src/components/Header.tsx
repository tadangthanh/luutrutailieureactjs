import { Link } from "react-router-dom";
import { Settings, User, Mail, Calendar, FileText, LogOut, X } from "lucide-react";
import { useState } from "react";
import { getUserProfile } from '../services/UserSearchApi';
import { User as UserType } from '../types/User';
import { formatDateTime } from '../utils/FormatDateTimeUtil';
import { useNavigate } from 'react-router-dom';
import SearchBar from "./SearchBar";

interface HeaderProps {
    activeMenu: string;
}

export const Header: React.FC<HeaderProps> = ({ activeMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserType>();
    const isLoggedIn = !!localStorage.getItem("accessToken");
    const navigate = useNavigate();

    const handleOpenProfile = () => {
        setIsOpen(true);
        getUserProfile().then((res) => {
            if (res.status === 200) {
                setUser(res.data);
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("avatarUrl");
        navigate("/login");
    };

    return (
        <>
            <header className="bg-white dark:bg-gray-900  px-8 pt-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 z-30  ">
                {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300 tracking-tight">
                    {activeMenu}
                </h1> */}
                <SearchBar />
                <div className="flex flex-wrap items-center gap-4">
                    {/* <button
                        onClick={triggerFileUpload}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                        <Upload size={18} />
                        Tải lên
                    </button>

                    <button
                        onClick={openCreateFolderModal}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <FolderPlus size={18} />
                        Tạo thư mục
                    </button> */}

                    {isLoggedIn ? (
                        <button
                            onClick={handleOpenProfile}
                            className="flex items-center gap-3 px-4 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-600 shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-base font-medium text-gray-800 dark:text-white">
                                Tài khoản
                            </span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-base font-medium transition-all duration-200 shadow-sm"
                        >
                            👤 Tài khoản
                        </Link>
                    )}
                </div>
            </header>

            {/* Slide-over Panel */}
            <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />

                {/* Panel */}
                <div
                    className={`absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông tin tài khoản</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {user ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt="Profile"
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-400" />
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName || 'User'}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <Mail className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-gray-900 dark:text-white">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <Calendar className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo tài khoản</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {user.createdAt ? formatDateTime(user.createdAt) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <FileText className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số tài liệu đã lưu trữ</p>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{user.totalDocuments}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
