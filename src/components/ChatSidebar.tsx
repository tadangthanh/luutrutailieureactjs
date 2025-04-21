import { Trash2Icon, ChevronDownIcon } from "lucide-react";
import { AssistantFile } from "../types/AssistantFile";

const MAX_VISIBLE = 10;

export default function ChatSidebar({
    sessions,
    selectedId,
    onSelect,
    onDelete,
    onLoadMore,
}: {
    sessions: AssistantFile[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
    onLoadMore: () => void;
}) {
    const visibleSessions = sessions.slice(0, MAX_VISIBLE);
    const hasMore = sessions.length > MAX_VISIBLE;

    return (
        <div className="w-52 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
            <div className="p-4 font-semibold text-base text-primary border-b border-gray-200 dark:border-gray-700">
                📂 Danh sách file
            </div>

            <ul>
                {visibleSessions.map((session) => (
                    <li
                        key={session.id}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-primary/10 ${selectedId === session.id ? "bg-primary/20" : ""
                            }`}
                        onClick={() => onSelect(session.id)}
                    >
                        <div className="text-sm text-gray-800 dark:text-white truncate w-[140px]">
                            {session.originalFileName}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(session.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>

            {hasMore && (
                <div
                    className="flex items-center justify-center p-3 text-sm text-primary hover:text-primary-dark cursor-pointer border-t border-gray-200 dark:border-gray-700"
                    onClick={onLoadMore}
                >
                    <ChevronDownIcon className="w-4 h-4 mr-1" />
                    Xem thêm
                </div>
            )}
        </div>

    );
}
