import { useEffect, useRef, useState } from "react";
import { Plus, MoreHorizontal, Trash2, Pen, ChevronLeft, ChevronRight } from "lucide-react";
import { PageResponse } from "../types/PageResponse";
import { ChatSessionDto } from "../types/ChatSessionDto";
import { motion } from "framer-motion";
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
            console.error("Error loading more chats:", error);
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
            animate={{ width: isCollapsed ? 56 : 256 }} // 56px ≈ w-14, 256px = w-64
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`flex flex-col h-full pt-4 ${isCollapsed ? "px-1" : "px-2 sm:px-4"}`}
        >
            {/* Nút thu gọn/mở rộng */}
            <div className={`flex justify-${isCollapsed ? "center" : "end"} mb-2`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 bg-primary text-black rounded-full shadow-md hover:scale-105 transition transform hover:shadow-lg"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>


            {/* Các phần còn lại sẽ ẩn nếu đang collapsed */}
            {!isCollapsed && (
                <>
                    {/* Nút tạo mới */}
                    <button
                        onClick={onCreateNewChat}
                        className="flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary-dark transition rounded-xl py-2.5 font-medium mb-4 sm:mb-6"
                    >
                        <Plus size={18} /> Tạo cuộc trò chuyện
                    </button>

                    {/* Danh sách */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] space-y-2 pr-1 custom-scrollbar">
                        {chatSessionsPage.items.map((chat) => {
                            const isSelected = chat === chatSelected;
                            return (
                                <div
                                    key={chat.id}
                                    className={`group relative cursor-pointer flex items-center justify-between px-2 py-3 text-sm shadow-sm transition rounded-xl 
                                    ${isSelected
                                            ? "bg-primary/10 border border-primary text-primary dark:border-primary"
                                            : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-white"
                                        }`}
                                >
                                    <span
                                        onClick={() => onChatSelect(chat)}
                                        className="truncate font-medium flex-1"
                                    >
                                        {chat.name}
                                    </span>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                            setOpenMenuId(prev => prev === chat.id ? null : chat.id);
                                            setMenuPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
                                        }}
                                        className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition ml-2"
                                        title="Tùy chọn"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            );
                        })}

                        {chatSessionsPage.hasNext && !isLoadingMore && (
                            <button
                                onClick={handleLoadMore}
                                className="text-primary hover:text-primary-dark mt-4 px-4 py-2 rounded-xl font-medium transition w-full text-center"
                            >
                                Xem thêm
                            </button>
                        )}

                        {isLoadingMore && (
                            <div className="text-center text-gray-500 mt-4">Đang tải thêm...</div>
                        )}
                    </div>
                </>
            )}

            {/* Menu nổi */}
            {!isCollapsed && openMenuId !== null && menuPosition && (
                <div
                    ref={menuRef}
                    className="fixed z-50 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <button
                        onClick={() => {
                            const chat = chatSessionsPage.items.find(c => c.id === openMenuId);
                            handleRename(openMenuId, chat?.name);
                            setOpenMenuId(null);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                    >
                        <Pen size={14} /> Đổi tên
                    </button>
                    <button
                        onClick={() => {
                            handleDelete(openMenuId);
                            setOpenMenuId(null);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                    >
                        <Trash2 size={14} /> Xóa
                    </button>
                </div>
            )}

            {/* Modals giữ nguyên */}
            {!isCollapsed && showConfirmId !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Xác nhận xóa</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={() => setShowConfirmId(null)}
                                className="px-4 py-2 rounded-xl text-sm bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-800 dark:text-white"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => confirmDelete(showConfirmId)}
                                className="px-4 py-2 rounded-xl text-sm bg-red-500 hover:bg-red-600 text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isCollapsed && renameTarget && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Đổi tên cuộc trò chuyện</h2>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-neutral-100 dark:bg-neutral-700 text-gray-800 dark:text-white"
                            placeholder="Nhập tên mới"
                            autoFocus
                        />
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={() => setRenameTarget(null)}
                                className="px-4 py-2 rounded-xl text-sm bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-800 dark:text-white"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmRename}
                                className="px-4 py-2 rounded-xl text-sm bg-primary hover:bg-primary-dark text-white"
                            >
                                Đổi tên
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* </div> */}
        </motion.div>
    );

};
