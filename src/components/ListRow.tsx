import React, { useEffect, useRef } from "react";
import {
    MoreHorizontal, Download, Edit, Share, File, Info, Trash, Copy, Folder, FileText,
} from "lucide-react";

interface ListRowProps {
    rowId: number;
    name: string;
    type: "file" | "folder";
    createdBy: string;
    updatedAt: string;
    ownerEmail: string;
    size?: string;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
}

const ListRow: React.FC<ListRowProps> = ({
    rowId,
    name,
    type,
    size,
    openMenuId,
    createdBy,
    updatedAt,
    ownerEmail,
    setOpenMenuId,
}) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isMenuOpen = openMenuId === rowId;

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setOpenMenuId(null);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(isMenuOpen ? null : rowId);
    };

    const handleAction = (action: string) => {
        console.log(`Action: ${action} for ${name}`);
        setOpenMenuId(null);
    };

    const renderIcon = () => type === "folder"
        ? <Folder size={16} className="mr-2" />
        : <FileText size={16} className="mr-2" />;
    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0'); // Ngày
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng
        const year = date.getFullYear(); // Năm

        return `${day}/${month}/${year}`;  // Định dạng ngày/tháng/năm (DD/MM/YYYY)
    }
    const formatOwner = (ownerEmail: string) => {
        if (ownerEmail === localStorage.getItem('email')) {
            return "Tôi";
        }
        return ownerEmail;
    }
    return (
        <div className="cursor-pointer grid grid-cols-5 items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
            <div className="col-span-1 flex items-center">
                {renderIcon()}
                {name}
            </div>
            <div className="col-span-1">{formatOwner(ownerEmail)}</div>
            <div className="col-span-1">{formatDate(updatedAt)}</div>
            <div className="col-span-1">{type === "folder" ? "--" : size}</div>
            <div className="col-span-1 flex justify-end relative">
                <button
                    onClick={handleMenuClick}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                    <MoreHorizontal size={18} />
                </button>

                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        className="absolute right-0 mt-7 w-52 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10"
                    >
                        <ul className="text-sm text-gray-700 dark:text-gray-200">
                            {[
                                { label: "Mở", icon: <File size={16} />, action: "open" },
                                { label: "Đổi tên", icon: <Edit size={16} />, action: "rename" },
                                { label: "Tải xuống", icon: <Download size={16} />, action: "download" },
                                { label: "Chia sẻ", icon: <Share size={16} />, action: "share" },
                                { label: "Thông tin", icon: <Info size={16} />, action: "info" },
                                { label: "Tạo bản sao", icon: <Copy size={16} />, action: "copy" },
                                { label: "Chuyển vào thùng rác", icon: <Trash size={16} />, action: "trash" },
                            ].map(({ label, icon, action }) => (
                                <li
                                    key={action}
                                    onClick={() => handleAction(action)}
                                    className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    {icon}
                                    <span className="ml-2">{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListRow;
