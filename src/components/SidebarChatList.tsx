import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Chat {
    id: string;
    title: string;
}

export default function SidebarChatList() {
    const [chats, setChats] = useState<Chat[]>([
        { id: "1", title: "Cuộc trò chuyện 1" },
        { id: "2", title: "Tài liệu khách hàng" },
        { id: "3", title: "Ghi chú cuộc họp" },
        { id: "4", title: "Cuộc trò chuyện 4" },
        { id: "5", title: "Cuộc trò chuyện 5" },
        { id: "6", title: "Cuộc trò chuyện 6" },
        { id: "7", title: "Cuộc trò chuyện 7" },
        { id: "8", title: "Cuộc trò chuyện 8" },
        { id: "9", title: "Cuộc trò chuyện 9" },
        { id: "10", title: "Cuộc trò chuyện 10" },
        { id: "11", title: "Cuộc trò chuyện 11" },
        { id: "12", title: "Cuộc trò chuyện 12" },
    ]);
    const [visibleChats, setVisibleChats] = useState<Chat[]>(chats.slice(0, 10));  // Hiển thị tối đa 10 cuộc trò chuyện
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleCreateNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: `Cuộc trò chuyện ${chats.length + 1}`,
        };
        setChats([newChat, ...chats]);
        setVisibleChats([newChat, ...visibleChats]);
    };

    const handleDeleteChat = (id: string) => {
        setChats((prev) => prev.filter((chat) => chat.id !== id));
        setVisibleChats((prev) => prev.filter((chat) => chat.id !== id));
    };

    const handleLoadMore = () => {
        setIsLoadingMore(true);

        // Giả lập quá trình tải thêm (bạn có thể thay thế bằng API thực tế)
        setTimeout(() => {
            setVisibleChats(chats);
            setIsLoadingMore(false);
        }, 1000);
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
                {visibleChats.map((chat) => (
                    <div
                        key={chat.id}
                        className="group flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl px-4 py-3 text-sm shadow-sm transition"
                    >
                        <span className="truncate text-gray-800 dark:text-white font-medium">{chat.title}</span>
                        <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                            title="Xóa cuộc trò chuyện"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {/* Nút "Xem thêm" nếu có nhiều hơn 10 phần tử */}
                {chats.length > 10 && !isLoadingMore && (
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
