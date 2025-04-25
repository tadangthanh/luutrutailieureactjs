import { MoreVertical, Edit, Share, File, Info, Trash, Copy } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { ItemResponse } from "../types/ItemResponse";

interface FolderCardProps {
    folder: ItemResponse;
    layout: "grid" | "list";
    onActionClick?: (e: React.MouseEvent) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, layout, onActionClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null); // Tham chiếu menu
    const handleMenuClick = (e: React.MouseEvent) => {
        setIsMenuOpen(!isMenuOpen);
        e.stopPropagation(); // Ngăn không cho click vào nút đóng menu
    };

    // Hàm để đóng menu khi click ra ngoài
    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    // Thêm và xóa sự kiện click khi component được mount và unmount
    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleAction = (action: string) => {
        console.log(`Action: ${action} for ${folder.name}`);
        setIsMenuOpen(false); // Đóng menu sau khi thực hiện hành động
    };

    return (
        <div
            className={`relative group bg-yellow-100 dark:bg-yellow-700 rounded-xl p-4 w-full shadow hover:shadow-md cursor-pointer 
                ${layout === "list" ? "flex items-center gap-3 max-w-full" : "max-w-[200px] text-center"}`}
        >
            {/* Nút ba chấm hiển thị khi hover */}
            <button
                onClick={handleMenuClick}
                className="absolute top-4 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 invisible group-hover:visible"
            >
                <MoreVertical size={18} className="text-gray-600 dark:text-white" />
            </button>

            <div className="font-semibold text-gray-800 dark:text-white">
                📁 {folder.name}
            </div>

            {/* Menu */}
            {isMenuOpen && (
                <div
                    ref={menuRef} // Gắn ref cho menu
                    className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700"
                >
                    <ul className="text-sm text-gray-700 dark:text-gray-200">
                        <li
                            onClick={() => handleAction("open")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <File size={16} className="mr-2" />
                            Mở
                        </li>
                        <li
                            onClick={() => handleAction("rename")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Edit size={16} className="mr-2" />
                            Đổi tên
                        </li>
                        <li
                            onClick={() => handleAction("share")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Share size={16} className="mr-2" />
                            Chia sẻ
                        </li>
                        <li
                            onClick={() => handleAction("info")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Info size={16} className="mr-2" />
                            Thông tin
                        </li>
                        <li
                            onClick={() => handleAction("copy")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Copy size={16} className="mr-2" />
                            Tạo bản sao
                        </li>
                        <li
                            onClick={() => handleAction("trash")}
                            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Trash size={16} className="mr-2" />
                            Chuyển vào thùng rác
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FolderCard;
