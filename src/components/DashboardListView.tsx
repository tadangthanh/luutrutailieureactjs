import { MoreHorizontal, Check, Bookmark } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Option } from "./Option";
import { ItemResponse } from "../types/ItemResponse";
import ListRow from "./ListRow";

interface DashboardListViewProps {
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    items: ItemResponse[];
    handleOpen(id: number): void;
    handleRename(id: number): void;
    handleDownload(id: number): void;
    handleShare(id: number): void;
    handleInfo(id: number): void;
    handleCopy(id: number): void;
    handleMoveToTrash(id: number): void;
    handleVersionHistory(id: number): void;
    handleSave: (id: number) => void;
    handleUnSave: (id: number) => void;
    onClick: (item: ItemResponse) => void;
}

const DashboardListView: React.FC<DashboardListViewProps> = ({
    openMenuId,
    setOpenMenuId,
    items,
    handleOpen,
    handleRename,
    handleDownload,
    handleShare,
    handleInfo,
    handleCopy,
    handleUnSave,
    handleMoveToTrash,
    handleVersionHistory,
    handleSave,
    onClick
}) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [folderDisplayMode, setFolderDisplayMode] = useState<"top" | "combined">("top");

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangeDisplay = (mode: "top" | "combined") => {
        setFolderDisplayMode(mode);
        setIsMenuOpen(false); // Close after selecting
    };

    return (
        <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-visible">
            <div className="grid grid-cols-6 bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 relative">
                <div className="col-span-2">Tên</div>
                <div>Chủ sở hữu</div>
                <div>Sửa đổi gần nhất</div>
                <div>Kích cỡ</div>
                <div className="col-span-1 flex justify-end relative">
                    <button
                        onClick={handleMenuClick}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-10 right-0 w-60 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10"
                            >
                                <ul className="text-sm text-gray-700 dark:text-gray-200 py-1">
                                    <li className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide">Hiển thị thư mục</li>
                                    <Option
                                        label="Trên cùng"
                                        icon={folderDisplayMode === "top" ? <Check size={16} /> : undefined}
                                        onClick={() => handleChangeDisplay("top")}
                                    />
                                    <Option
                                        label="Kết hợp với tệp"
                                        icon={folderDisplayMode === "combined" ? <Check size={16} /> : undefined}
                                        onClick={() => handleChangeDisplay("combined")}
                                    />
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {items.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                    Không có tài liệu nào
                </div>
            )}

            {(folderDisplayMode === "top"
                ? [...items].sort((a, b) => {
                    if (a.itemType === b.itemType) return 0;
                    return a.itemType === "FOLDER" ? -1 : 1;
                })
                : items
            ).map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                    <ListRow
                        onClick={onClick}
                        item={item}
                        handleUnSave={handleUnSave}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        handleCopy={handleCopy}
                        handleDownload={handleDownload}
                        handleInfo={handleInfo}
                        handleMoveToTrash={handleMoveToTrash}
                        handleOpen={handleOpen}
                        handleRename={handleRename}
                        handleShare={handleShare}
                        handleVersionHistory={handleVersionHistory}
                        handleSave={handleSave}
                    />
                </motion.div>
            ))}

        </div>
    );
};

export default DashboardListView;
