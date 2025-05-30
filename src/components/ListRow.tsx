import React, { useEffect, useRef } from "react";
import {
    MoreHorizontal, Download, Edit, File, Info, Trash, Copy, FileText,
    FolderClosed,
    History,
    Bookmark,
    LucideBotMessageSquare,
    Share2,
    Trash2
} from "lucide-react";
import { ItemResponse } from "../types/ItemResponse";
import { Option } from "./Option";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatDateTime } from "../utils/FormatDateTimeUtil";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";

interface ListRowProps {
    item: ItemResponse;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
}

const ListRow: React.FC<ListRowProps> = ({
    item,
    openMenuId,
    setOpenMenuId,
}) => {
    const {
        handleOpen,
        handleRename,
        handleDownload,
        handleShare,
        handleInfo,
        handleCopy,
        handleMoveToTrash,
        handleVersionHistory,
        handleItemClick,
        handleSave,
        handleUnSave,
        isEditor
    } = useDashboard();

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
        ? <FolderClosed size={16} className="mr-2" />
        : <FileText size={16} className="mr-2" />;

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

    const navigate = useNavigate();
    const handleAsk = (id: number) => {
        navigate(`/document-assistant?documentId=${id}`);
    };

    return (
        <div
            onClick={() => handleItemClick(item)}
            className="group cursor-pointer grid grid-cols-6 items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700"
        >
            {/* Cột tên */}
            <div className="truncate col-span-2 flex items-center" title={item.name}>
                {renderIcon()}
                {item.name}
            </div>

            {/* Cột chủ sở hữu */}
            <div className="col-span-1" title={item.ownerEmail}>
                {formatOwner(item.ownerEmail)}
            </div>

            {/* Cột sửa đổi */}
            <div className="col-span-1" title={formatDateTime(item.updatedAt)}>
                {formatDate(item.updatedAt)}
            </div>

            {/* Cột kích thước */}
            <div className="col-span-1">
                {item.itemType === "FOLDER" ? "--" : formatBytes(item.size)}
            </div>

            {/* Cột action */}
            <div className="col-span-1 flex justify-end items-center gap-1 relative">
                {/* Các nút hành động nhanh - chỉ hiện khi hover */}
                <div className="hidden group-hover:flex items-center gap-1">
                    {item.itemType === "DOCUMENT" &&
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAsk(item.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="AI hỏi đáp"
                        >
                            <LucideBotMessageSquare size={16} />
                        </button>
                    }
                    {/* download */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Tải xuống"
                    >
                        <Download size={16} />
                    </button>
                    {/* share */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Chia sẻ"
                    >
                        <Share2 size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRename(item.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Đổi tên"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            item.saved ? handleUnSave(item.id) : handleSave(item.id);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title={item.saved ? "Bỏ lưu" : "Lưu"}
                    >
                        <Bookmark
                            size={16}
                            className={item.saved ? "text-yellow-500 fill-yellow-500" : ""}
                        />
                    </button>
                </div>

                {/* Nút mở menu chi tiết */}
                <button
                    onClick={handleMenuClick}
                    className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                    <MoreHorizontal size={18} />
                </button>

                {/* Menu chi tiết */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10"
                        >
                            <ul className="text-sm text-gray-700 dark:text-gray-200">
                                <Option label="Mở" icon={<File size={16} />} onClick={() => handleOpen(item.id)} />
                                <Option label="Thông tin" icon={<Info size={16} />} onClick={() => handleInfo(item.id)} />
                                <Option label="Tải xuống" icon={<Download size={16} />} onClick={() => handleDownload(item.id)} />
                                {item.itemType === "DOCUMENT" && (
                                    <>
                                        <Option label="Tạo bản sao" icon={<Copy size={16} />} onClick={() => handleCopy(item.id)} />
                                        <Option label="Lịch sử phiên bản" icon={<History size={16} />} onClick={() => handleVersionHistory(item.id)} />
                                    </>
                                )}
                                {isEditor && <Option label={item.createdBy === localStorage.getItem('email') ? "Chuyển vào thùng rác" : "Xóa"} icon={item.createdBy === localStorage.getItem('email') ? <Trash size={16} /> : <Trash2 size={16} />} onClick={() => handleMoveToTrash(item.id)} />}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );

};

export default ListRow;
