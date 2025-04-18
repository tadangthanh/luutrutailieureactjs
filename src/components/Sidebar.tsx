import { Link } from "react-router-dom"; // Import Link từ react-router-dom
import { Home, Share2, Trash2 } from "lucide-react";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
            <div className="p-4 font-bold text-xl">Drive</div>
            <nav className="flex flex-col gap-2 p-4 text-gray-700 dark:text-gray-300">
                {/* Cập nhật button thành Link */}
                <Link to="/" className="flex items-center gap-2 hover:text-blue-600">
                    <Home size={18} /> Tài liệu của tôi
                </Link>
                <Link to="/shared" className="flex items-center gap-2 hover:text-blue-600">
                    <Share2 size={18} /> Đã chia sẻ
                </Link>
                <Link to="/trash" className="flex items-center gap-2 hover:text-blue-600">
                    <Trash2 size={18} /> Thùng rác
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
