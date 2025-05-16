import React from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Copy } from 'lucide-react';
import { SharedLinkResponse } from '../types/SharedLinkResponse';
import { toast } from 'sonner';

interface SharedLinkItemProps {
    link: SharedLinkResponse;
    onEdit: (link: SharedLinkResponse) => void;
    onToggleStatus: (link: SharedLinkResponse) => void;
    onDelete: (link: SharedLinkResponse) => void;
}

const SharedLinkItem: React.FC<SharedLinkItemProps> = ({ link, onEdit, onToggleStatus, onDelete }) => {
    const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/shared/${link.accessToken}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Đã sao chép link!');
    };

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {link.isActive ? (
                        <CheckCircle2 className="text-green-500" size={16} />
                    ) : (
                        <Circle className="text-gray-400" size={16} />
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {link.expiresAt && (
                            <div>Hết hạn: {new Date(link.expiresAt).toLocaleString()}</div>
                        )}
                        <div>Truy cập: {link.currentViews}/{link.maxViews || '∞'}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        title="Sao chép link"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(link)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        title="Chỉnh sửa"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(link)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        title={link.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                        {link.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                        onClick={() => onDelete(link)}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Xóa"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedLinkItem; 