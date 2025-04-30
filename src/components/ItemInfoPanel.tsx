import React from "react";

import { ItemResponse } from "../types/ItemResponse";
import ResizableSlidePanel from "./ResizableSlidePanel";
import { formatDateTime } from "../utils/FormatDateTimeUtil";


interface ItemInfoPanelProps {
    item: ItemResponse | null;
    isLoading: boolean;
    onClose: () => void;
}

export const ItemInfoPanel: React.FC<ItemInfoPanelProps> = ({ item, isLoading, onClose }) => {
    if (!item) return null;

    return (
        <ResizableSlidePanel onClose={onClose}>
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                </div>
            ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                    <div><strong>Tên:</strong> {item.name}</div>
                    <div><strong>Loại:</strong> {item.itemType === "DOCUMENT" ? "Tài liệu" : "Thư mục"}</div>
                    <div><strong>Ngày tạo:</strong> {formatDateTime(item.createdAt)}</div>
                    <div><strong>Ngày sửa:</strong> {formatDateTime(item.updatedAt)}</div>
                </div>
            )}
        </ResizableSlidePanel>
    );
};
