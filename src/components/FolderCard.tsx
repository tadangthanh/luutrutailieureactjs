import { MoreVertical, Edit, File, Info, Trash, Folder, Download, UserPlus } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { ItemResponse } from "../types/ItemResponse";
import { Option } from "./Option";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../contexts/DashboardContext";

interface FolderCardProps {
    folder: ItemResponse;
    layout: "grid" | "list";
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, layout }) => {
    const {
        handleOpen,
        handleRename,
        handleDownload,
        handleShare,
        handleInfo,
        handleMoveToTrash,
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

    return (
        <div onClick={() => handleItemClick(folder)}
            className={`relative group rounded-2xl p-4 w-full shadow-sm hover:shadow-md cursor-pointer transition-all
            ${layout === "list"
                    ? "flex items-center gap-3 bg-secondary/30 dark:bg-secondary/40"
                    : "flex flex-col items-start bg-secondary/20 dark:bg-secondary/30 max-w-[200px]"}`
            }
        >
            {/* Menu button */}
            <button
                onClick={handleMenuClick}
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 invisible group-hover:visible z-10"
            >
                <MoreVertical size={18} className="text-gray-600 dark:text-white" />
            </button>

            {/* Folder icon + name */}
            <div className={`flex items-center gap-2 w-full ${layout === "list" ? "" : "flex-col items-start"}`}>
                <Folder className="text-yellow-500 dark:text-yellow-300" size={32} />
                <span
                    className="font-medium text-gray-800 dark:text-white truncate max-w-full"
                    title={folder.name}
                >
                    {folder.name}
                </span>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        ref={menuRef}
                        className="absolute top-10 right-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-20"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ul className="text-sm text-gray-700 dark:text-gray-200">
                            <Option label="Mở" icon={<File size={16} />} onClick={() => handleOpen(folder.id)} />
                            <Option label="Đổi tên" icon={<Edit size={16} />} onClick={() => handleRename(folder.id)} />
                            <Option label="Thông tin" icon={<Info size={16} />} onClick={() => handleInfo(folder.id)} />
                            <Option label="Tải xuống" icon={<Download size={16} />} onClick={() => handleDownload(folder.id)} />
                            <Option label="Chia sẻ" icon={<UserPlus size={16} />} onClick={() => handleShare(folder.id)} />
                            {isEditor && <Option label="Chuyển vào thùng rác" icon={<Trash size={16} />} onClick={() => handleMoveToTrash(folder.id)} />}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default FolderCard;
