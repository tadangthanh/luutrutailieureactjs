import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentVersionResponse } from '../types/DocumentVersionResponse';
import { formatDateTime } from '../utils/FormatDateTimeUtil';
import { Download, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { getVersionHistory, restoreVersion, downloadVersion } from '../services/DocumentApi';
import { getFileTypeName, getFileExtensionFromMimeType } from '../utils/FileTypeUtil';
import { toast } from 'sonner';

interface VersionHistoryDialogProps {
    documentId: number;
    onClose: () => void;
    onRestoreSuccess?: (documentId: number, version: DocumentVersionResponse) => void;
}

const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({ documentId, onClose, onRestoreSuccess }) => {
    const [versions, setVersions] = useState<DocumentVersionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<number | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        getVersionHistory(documentId).then((res) => {
            setIsLoading(true);
            if (res.status === 200) {
                setVersions(res.data);
                // Set current version as the highest version number
                const maxVersion = Math.max(...res.data.map((v: DocumentVersionResponse) => v.version));
                setCurrentVersion(maxVersion);
            } else {
                toast.error("Không thể tải lịch sử phiên bản.");
            }
        }).catch((err) => {
            toast.error("Không thể tải lịch sử phiên bản.");
        }).finally(() => {
            setIsLoading(false);
        })
    }, [documentId]);

    const handleRestore = async () => {
        if (!selectedVersion) return;

        setIsRestoring(true);
        try {
            const response = await restoreVersion(documentId, selectedVersion);
            if (response.status === 200) {
                toast.success("Đã khôi phục phiên bản thành công");
                // Find the restored version
                const restoredVersion = versions.find(v => v.id === selectedVersion);
                if (restoredVersion && onRestoreSuccess) {
                    onRestoreSuccess(documentId, restoredVersion);
                }
                onClose();
            }
        } catch (error) {
            toast.error("Khôi phục phiên bản thất bại");
        } finally {
            setIsRestoring(false);
            setShowConfirmDialog(false);
        }
    };

    const handleDownload = async (versionId: number) => {
        try {
            setIsLoading(true);
            await downloadVersion(versionId);
        } catch (error) {
            toast.error("Tải xuống thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreClick = (version: number) => {
        setSelectedVersion(version);
        setShowConfirmDialog(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lịch sử phiên bản</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Không có phiên bản nào
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">Thời gian</div>
                                <div className="col-span-2">Loại</div>
                                <div className="col-span-2">Kích thước</div>
                                <div className="col-span-2">Hết hạn</div>
                                <div className="col-span-2">Thao tác</div>
                            </div>
                            <div className="custom-scrollbar space-y-2 max-h-[50vh] overflow-y-auto">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className={`grid grid-cols-12 gap-4 items-center p-2 rounded ${version.version === currentVersion
                                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                            : selectedVersion === version.version
                                                ? 'bg-primary/10 dark:bg-primary/20'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="col-span-1 text-sm">
                                            {version.version}
                                            {version.version === currentVersion && (
                                                <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Hiện tại)</span>
                                            )}
                                        </div>
                                        <div className="col-span-3 text-sm text-gray-700 dark:text-gray-300">
                                            {formatDateTime(version.updatedAt)}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">
                                            {getFileTypeName(version.type)}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">
                                            {formatBytes(version.size)}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">
                                            {formatDateTime(version.expiredAt)}
                                        </div>
                                        <div className="col-span-2 flex space-x-2">
                                            <button
                                                onClick={() => handleDownload(version.id)}
                                                className="p-1 rounded text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                                                title="Tải xuống"
                                            >
                                                <Download size={16} />
                                            </button>
                                            {version.version !== currentVersion && (
                                                <button
                                                    onClick={() => handleRestoreClick(version.id)}
                                                    className={`p-1 rounded ${selectedVersion === version.version
                                                        ? 'text-primary'
                                                        : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary'
                                                        }`}
                                                    title="Khôi phục phiên bản này"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Xác nhận khôi phục phiên bản
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Bạn có chắc chắn muốn khôi phục về phiên bản {selectedVersion}?
                            Phiên bản hiện tại sẽ được lưu lại và bạn có thể khôi phục lại sau.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={isRestoring}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isRestoring ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Đang khôi phục...</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw size={16} />
                                        <span>Khôi phục</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default VersionHistoryDialog; 