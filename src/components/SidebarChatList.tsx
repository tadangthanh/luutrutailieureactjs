import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageResponse } from "../types/PageResponse";
import { ChatSessionDto } from "../types/ChatSessionDto";

interface ChatListProps {
    onChatSelect: (chatSession: ChatSessionDto) => void;
    chatSelected: ChatSessionDto | null;
    onChatDelete: (id: number) => void;
    chatSessionsPage: PageResponse<ChatSessionDto>;
    onLoadMore: () => void;
}

export const SidebarChatList: React.FC<ChatListProps> = ({ onChatDelete, onChatSelect, chatSessionsPage, onLoadMore, chatSelected }) => {

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            await onLoadMore();
        } catch (error) {
            console.error("Error loading more chats:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }
    const handleCreateNewChat = () => {

    };


    return (
        <div className="flex flex-col h-full px-4 sm:px-6 pt-4">
            {/* Nút tạo mới */}
            <button
                onClick={handleCreateNewChat}
                className="flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary-dark transition rounded-xl py-2.5 font-medium mb-4 sm:mb-6"
            >
                <Plus size={18} /> Tạo cuộc trò chuyện
            </button>

            {/* Danh sách cuộc trò chuyện */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] space-y-2 pr-1 custom-scrollbar">
                {chatSessionsPage.items.map((chat) => {
                    const isSelected = chat === chatSelected;
                    return (
                        <div
                            onClick={() => onChatSelect(chat)}
                            key={chat.id}
                            className={`group cursor-pointer flex items-center justify-between px-4 py-3 text-sm shadow-sm transition rounded-xl 
                                ${isSelected
                                    ? "bg-primary/10 border border-primary text-primary dark:border-primary"
                                    : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-white"
                                }`}
                        >
                            <span className="truncate font-medium">{chat.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChatDelete(chat.id);
                                }}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                                title="Xóa cuộc trò chuyện"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}

                {/* Nút "Xem thêm" */}
                {chatSessionsPage.hasNext && !isLoadingMore && (
                    <button
                        onClick={handleLoadMore}
                        className="text-primary hover:text-primary-dark mt-4 px-4 py-2 rounded-xl font-medium transition w-full text-center"
                    >
                        Xem thêm
                    </button>
                )}

                {isLoadingMore && (
                    <div className="text-center text-gray-500 mt-4">
                        Đang tải thêm...
                    </div>
                )}
            </div>
        </div>
    );
}
