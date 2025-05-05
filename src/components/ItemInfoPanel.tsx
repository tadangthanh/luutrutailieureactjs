import React from "react";
import { ItemResponse } from "../types/ItemResponse";
import ResizableSlidePanel from "./ResizableSlidePanel";
import { formatDateTime } from "../utils/FormatDateTimeUtil";
import { FileText, Folder, Calendar, Clock } from "lucide-react";

interface ItemInfoPanelProps {
    item: ItemResponse | null;
    isLoading: boolean;
    onClose: () => void;
}

export const ItemInfoPanel: React.FC<ItemInfoPanelProps> = ({ item, isLoading, onClose }) => {
    if (!item) return null;

    return (
        <ResizableSlidePanel onClose={onClose}>
            <div className="p-6">
                {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                {item.itemType === "DOCUMENT" ? (
                                    <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Folder size={24} className="text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.itemType === "DOCUMENT" ? "Tài liệu" : "Thư mục"}
                                </p>
                            </div>
                        </div>

                        {/* Info List */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Ngày tạo</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(item.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Clock size={18} className="text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Ngày sửa</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(item.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ResizableSlidePanel>
    );
};
