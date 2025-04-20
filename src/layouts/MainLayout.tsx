import { ReactNode, useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { toast } from "sonner";
import api from "../utils/api";
import webSocketService from "../services/WebSocketService";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{
        fileName: string;
        percent: number;
        currentChunk: number;
        total: number;
    } | null>(null);

    const handleMessage = useCallback((message: string) => {
        const msg = JSON.parse(message);

        // Progress đang upload
        if (msg.progressPercent !== undefined) {
            setUploadProgress({
                fileName: msg.fileName,
                percent: msg.progressPercent,
                currentChunk: msg.currentChunk,
                total: msg.totalChunks,
            });
        }

        // Hoàn tất hoặc bị hủy
        if (msg.documents || msg.cancelled !== undefined) {
            if (msg.cancelled) {
                toast.warning("Upload đã bị huỷ.");
            } else {
                toast.success("Tải lên hoàn tất!");
            }
            setTimeout(() => setUploadProgress(null), 2000);
            webSocketService.unsubscribeUploadProgress();
            webSocketService.unsubscribeUploadCompleted();
        }
    }, []);

    // Kết nối WebSocket 1 lần khi mount
    useEffect(() => {
        webSocketService.connect(handleMessage);
        return () => {
            webSocketService.disconnect();
        };
    }, [handleMessage]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        // 👉 Bắt đầu subscribe khi bắt đầu upload
        webSocketService.subscribeUploadProgress(handleMessage);
        webSocketService.subscribeUploadCompleted(handleMessage);

        try {
            const res = await api.post(`/documents`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                setUploadId(res.data.data);
            } else {
                toast.error("Tải tệp thất bại.");
                webSocketService.unsubscribeUploadProgress();
                webSocketService.unsubscribeUploadCompleted();
            }
        } catch (err) {
            toast.error("Tải tệp thất bại.");
            webSocketService.unsubscribeUploadProgress();
            webSocketService.unsubscribeUploadCompleted();
            console.error(err);
        }
    }, [handleMessage]);

    const handleCancelUpload = async () => {
        if (!uploadId) return;
        try {
            const res = await api.post(`/documents/cancel?uploadId=${uploadId}`);
            console.log(res.data);
            toast.info("Đã hủy upload.");
        } catch (error) {
            toast.error("Hủy upload thất bại.");
            console.error("Cancel upload error:", error);
        } finally {
            setUploadProgress(null);
            setUploadId(null);
            webSocketService.unsubscribeUploadProgress();
            webSocketService.unsubscribeUploadCompleted();
        }
    };

    useEffect(() => {
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
        };
    }, [handleDragOver, handleDragLeave, handleDrop]);

    return (
        <div className="flex h-screen relative ">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative custom-scrollbar">
                    {children}
                    {isDragging && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pointer-events-none">
                            <div className="text-white text-2xl font-bold border-4 border-dashed p-10 rounded-lg">
                                Thả tệp vào đây để tải lên
                            </div>
                        </div>
                    )}
                    {uploadProgress && (
                        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-72">
                            <p className="text-sm text-primary font-semibold mb-2 truncate">
                                Đang upload: {uploadProgress.fileName}
                            </p>
                            <progress
                                className="w-full h-3 transition-all duration-200 ease-in-out"
                                value={uploadProgress.percent}
                                max={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-secondary">
                                    {uploadProgress.currentChunk}/{uploadProgress.total} chunks ({uploadProgress.percent}%)
                                </p>
                                {uploadProgress.percent < 100 && (
                                    <button
                                        onClick={handleCancelUpload}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
