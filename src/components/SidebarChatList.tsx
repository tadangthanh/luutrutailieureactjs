import { useEffect, useRef, useState } from "react";
import { Plus, MoreHorizontal, Trash2, Pen, ChevronLeft, ChevronRight, Loader2, MessageSquare } from "lucide-react";
import { PageResponse } from "../types/PageResponse";
import { ChatSessionDto } from "../types/ChatSessionDto";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatListProps {
    onChatSelect: (chatSession: ChatSessionDto) => void;
    chatSelected: ChatSessionDto | null;
    onChatDelete: (id: number) => void;
    onCreateNewChat: () => void;
    onChatRename?: (id: number, newName: string) => void;
    chatSessionsPage: PageResponse<ChatSessionDto>;
    onLoadMore: () => void;
}

export const SidebarChatList: React.FC<ChatListProps> = ({
    onChatDelete,
    onChatRename,
    onCreateNewChat,
    onChatSelect,
    chatSessionsPage,
    onLoadMore,
    chatSelected,
}) => {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [showConfirmId, setShowConfirmId] = useState<number | null>(null);
    const [renameTarget, setRenameTarget] = useState<{ id: number; oldName: string } | null>(null);
    const [newName, setNewName] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            await onLoadMore();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tải thêm cuộc trò chuyện. Vui lòng thử lại sau.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleDelete = (id: number) => {
        setShowConfirmId(id);
    };

    const confirmDelete = (id: number) => {
        onChatDelete(id);
        setShowConfirmId(null);
    };

    const handleRename = (id: number, oldName: string | undefined) => {
        if (oldName) {
            setRenameTarget({ id, oldName });
            setNewName(oldName);
        }
    };

    const confirmRename = () => {
        if (newName.trim() !== "" && newName !== renameTarget?.oldName) {
            onChatRename?.(renameTarget!.id, newName.trim());
        }
        setRenameTarget(null);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <motion.div
            animate={{ width: isCollapsed ? 56 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`flex flex-col h-full pt-4 ${isCollapsed ? "px-1" : "px-3"} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg`}
        >
            {/* Nút thu gọn/mở rộng */}
            <div className={`flex justify-${isCollapsed ? "center" : "end"} mb-6`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Các phần còn lại sẽ ẩn nếu đang collapsed */}
            {!isCollapsed && (
                <>
                    {/* Nút tạo mới */}
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={onCreateNewChat}
                        className="flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-xl py-3 font-medium mb-6 shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} /> Tạo mới
                    </motion.button>

                    {/* Danh sách */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] space-y-2 pr-1 custom-scrollbar">
                        <AnimatePresence>
                            {chatSessionsPage.items.map((chat) => {
                                const isSelected = chatSelected?.id === chat.id;
                                return (
                                    <motion.div
                                        key={chat.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`group relative cursor-pointer flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 rounded-xl 
                                        ${isSelected
                                                ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-md"
                                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <MessageSquare size={18} className={`flex-shrink-0 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                                            <span
                                                onClick={() => onChatSelect(chat)}
                                                className="truncate font-medium"
                                            >
                                                {chat.name}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                setOpenMenuId(prev => prev === chat.id ? null : chat.id);
                                                setMenuPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                            title="Tùy chọn"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {chatSessionsPage.hasNext && !isLoadingMore && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleLoadMore}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm"
                            >
                                Xem thêm
                            </motion.button>
                        )}

                        {isLoadingMore && (
                            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mt-4">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Đang tải thêm...
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Menu nổi */}
            <AnimatePresence>
                {!isCollapsed && openMenuId !== null && menuPosition && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        ref={menuRef}
                        className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{ top: menuPosition.top, left: menuPosition.left }}
                    >
                        <button
                            onClick={() => {
                                const chat = chatSessionsPage.items.find(c => c.id === openMenuId);
                                handleRename(openMenuId, chat?.name);
                                setOpenMenuId(null);
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        >
                            <Pen size={16} /> Đổi tên
                        </button>
                        <button
                            onClick={() => {
                                handleDelete(openMenuId);
                                setOpenMenuId(null);
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        >
                            <Trash2 size={16} /> Xóa
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {!isCollapsed && showConfirmId !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Xác nhận xóa</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setShowConfirmId(null)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => confirmDelete(showConfirmId)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                                >
                                    Xóa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isCollapsed && renameTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Đổi tên cuộc trò chuyện</h2>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Nhập tên mới"
                                autoFocus
                            />
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setRenameTarget(null)}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmRename}
                                    className="px-4 py-2.5 rounded-xl text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                                >
                                    Đổi tên
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

};
