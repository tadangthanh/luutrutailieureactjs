import {
    MoreVertical,
    Edit,
    FileText,
    Info,
    Trash,
    Download,
    Copy,
    UserPlus,
    File,
    History,
    LucideBotMessageSquare,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { ItemResponse } from "../types/ItemResponse";
import { Option } from "./Option";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";

interface FileCardProps {
    doc: ItemResponse;
    layout: "grid" | "list";
}

const FileCard: React.FC<FileCardProps> = ({ layout, doc }) => {
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
        isEditor
    } = useDashboard();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navigate = useNavigate();
    const handleAsk = (id: number) => {
        navigate(`/document-assistant?documentId=${id}`);
    };

    return (
        <div
            onClick={() => handleItemClick(doc)}
            className={`relative group rounded-2xl p-4 w-full shadow-sm hover:shadow-md cursor-pointer transition-all
            ${layout === "list"
                    ? "flex items-center gap-3 bg-neutral-light dark:bg-neutral-dark"
                    : "flex flex-col items-start bg-white dark:bg-gray-700 max-w-[200px]"}`
            }
        >
            {/* Ba chấm menu */}
            <button
                onClick={handleMenuClick}
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 invisible group-hover:visible z-10"
            >
                <MoreVertical size={18} className="text-gray-600 dark:text-white" />
            </button>

            {/* Icon + Tên file */}
            <div className={`flex items-center gap-2 w-full ${layout === "list" ? "" : "flex-col items-start"}`}>
                <FileText className="text-blue-500 dark:text-blue-300" size={28} />
                <span
                    className="font-medium text-gray-800 dark:text-white truncate max-w-full"
                    title={doc.name}
                >
                    {doc.name}
                </span>
            </div>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-10 right-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-20"
                    >
                        <ul className="text-sm text-gray-700 dark:text-gray-200">
                            <Option label="Mở" icon={<File size={16} />} onClick={() => handleOpen(doc.id)} />
                            <Option label="Đổi tên" icon={<Edit size={16} />} onClick={() => handleRename(doc.id)} />
                            <Option label="Thông tin" icon={<Info size={16} />} onClick={() => handleInfo(doc.id)} />
                            <Option label="Tải xuống" icon={<Download size={16} />} onClick={() => handleDownload(doc.id)} />
                            <Option label="Chia sẻ" icon={<UserPlus size={16} />} onClick={() => handleShare(doc.id)} />
                            <Option label="Tạo bản sao" icon={<Copy size={16} />} onClick={() => handleCopy(doc.id)} />
                            {doc.itemType !== "FOLDER" && (
                                <>
                                    <Option label="AI hỏi đáp" icon={<LucideBotMessageSquare size={16} />} onClick={(e) => {
                                        e.stopPropagation();
                                        handleAsk(doc.id);
                                    }} />
                                    <Option label="Lịch sử phiên bản" icon={<History size={16} />} onClick={() => handleVersionHistory(doc.id)} />
                                </>
                            )}
                            {isEditor && <Option label="Chuyển vào thùng rác" icon={<Trash size={16} />} onClick={() => handleMoveToTrash(doc.id)} />}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default FileCard;
