import React, { useEffect, useRef } from "react";
import {
    MoreHorizontal, Download, Edit, Share, File, Info, Trash, Copy, Folder, FileText,
    UserPlus,
} from "lucide-react";
import { Option } from "./Option";
import { ItemResponse } from "../types/ItemResponse";

interface ListRowProps {
    item: ItemResponse
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    handleOpen(id: number): void;
    handleRename(id: number): void;
    handleDownload(id: number): void;
    handleShare(id: number): void;
    handleInfo(id: number): void;
    handleCopy(id: number): void;
    handleMoveToTrash(id: number): void;
}

const ListRow: React.FC<ListRowProps> = ({
    item,
    openMenuId,
    setOpenMenuId,
    handleOpen,
    handleRename,
    handleDownload,
    handleShare,
    handleInfo,
    handleCopy,
    handleMoveToTrash,
}) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isMenuOpen = openMenuId === item.id;

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
        setOpenMenuId(isMenuOpen ? null : item.id);
    };


    const renderIcon = () => item.itemType === "FOLDER"
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
    function formatBytes(bytes: number | null, decimals = 2) {
        if (!bytes) return '--';
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    function formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');     // Ngày
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (getMonth() trả về từ 0-11)
        const year = date.getFullYear();                         // Năm
        const hours = String(date.getHours()).padStart(2, '0');   // Giờ
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Phút

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    return (
        <div className="cursor-pointer grid grid-cols-6 items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
            <div className="truncate col-span-2 flex items-center" title={item.name}>
                {renderIcon()}
                {item.name}
            </div>
            <div className="col-span-1" title={item.ownerEmail}>{formatOwner(item.ownerEmail)}</div>
            <div className="col-span-1" title={formatDateTime(item.updatedAt)}>{formatDate(item.updatedAt)}</div>
            <div className="col-span-1">{item.itemType === "FOLDER" ? "--" : formatBytes(item.size)}</div>
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
                            <Option
                                label="Mở"
                                icon={<File size={16} />}
                                onClick={() => handleOpen(item.id)} />
                            <Option
                                label="Đổi tên"
                                icon={<Edit size={16} />}
                                onClick={() => handleRename(item.id)} />
                            <Option
                                label="Thông tin"
                                icon={<Info size={16} />}
                                onClick={() => handleInfo(item.id)} />
                            <Option
                                label="Tải xuống"
                                icon={<Download size={16} />}
                                onClick={() => handleDownload(item.id)} />
                            <Option
                                label="Chia sẻ"
                                icon={<UserPlus size={16} />}
                                onClick={() => handleShare(item.id)} />
                            {item.itemType !== "FOLDER" && (
                                <Option
                                    label="Tạo bản sao"
                                    icon={<Copy size={16} />}
                                    onClick={() => handleCopy(item.id)} />
                            )}
                            <Option
                                label="Chuyển vào thùng rác"
                                icon={<Trash size={16} />}
                                onClick={() => handleMoveToTrash(item.id)} />
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListRow;
