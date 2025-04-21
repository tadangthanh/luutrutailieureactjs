import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AssistantFile } from "../types/AssistantFile";
import { PageResponse } from "../types/PageResponse";

interface ChatListProps {
    onChatSelect: (assistantFileId: number) => void;
    onChatDelete: (id: number) => void;
    pageAssistantFile: PageResponse<AssistantFile>;
    onLoadMore: () => void;
}

export const SidebarChatList: React.FC<ChatListProps> = ({ onChatDelete, onChatSelect, pageAssistantFile, onLoadMore }) => {

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
        <div className="flex flex-col h-full">
            {/* Nút tạo mới */}
            <button
                onClick={handleCreateNewChat}
                className="flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary-dark transition rounded-xl py-2.5 font-medium mb-6"
            >
                <Plus size={18} /> Tạo cuộc trò chuyện
            </button>

            {/* Danh sách cuộc trò chuyện */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-160px)] space-y-2 custom-scrollbar"> {/* Thêm overflow và max-height */}
                {pageAssistantFile.items.map((chat) => (
                    <div
                        onClick={() => onChatSelect(chat.id)}
                        key={chat.id}
                        className="group cursor-pointer flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl px-4 py-3 text-sm shadow-sm transition"
                    >
                        <span className="truncate text-gray-800 dark:text-white font-medium">{chat.originalFileName}</span>
                        <button
                            onClick={() => onChatDelete(chat.id)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                            title="Xóa cuộc trò chuyện"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {/* Nút "Xem thêm" nếu có nhiều hơn 10 phần tử */}
                {pageAssistantFile.hasNext && !isLoadingMore && (
                    <button
                        onClick={handleLoadMore}
                        className="text-primary hover:text-primary-dark mt-4 px-4 py-2 rounded-xl font-medium transition"
                    >
                        Xem thêm
                    </button>
                )}

                {/* Loading trạng thái */}
                {isLoadingMore && (
                    <div className="text-center text-gray-500 mt-4">
                        Đang tải thêm...
                    </div>
                )}
            </div>
        </div>
    );
}
