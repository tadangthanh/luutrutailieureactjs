import { useEffect, useState, useCallback } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import { ItemResponse } from "../types/ItemResponse";
import { getItems } from "../services/ItemApi";
import api from "../utils/api";
import webSocketService from "../services/WebSocketService";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [pageNo, setPageNo] = useState<number>(0);
    const [items, setItems] = useState<string[]>([]);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{
        fileName: string;
        percent: number;
        currentChunk: number;
        total: number;
    } | null>(null);

    const [itemPage, setItemPage] = useState<PageResponse<ItemResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });

    const handleMessage = useCallback((message: string) => {
        const msg = JSON.parse(message);
        if (msg.progressPercent !== undefined) {
            setUploadProgress({
                fileName: msg.fileName,
                percent: msg.progressPercent,
                currentChunk: msg.currentChunk,
                total: msg.totalChunks,
            });
        }
    }, []);


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

        webSocketService.subscribeUploadProgress(handleMessage);
        webSocketService.subscribeUploadCompleted(handleUploadCompleted);

        try {
            const res = await api.post(`/documents`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
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
            await api.post(`/documents/cancel?uploadId=${uploadId}`);
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
    const handleUploadCompleted = useCallback((message: string) => {
        const msg = JSON.parse(message);
        if (msg.cancelled) {
            toast.warning("Upload đã bị huỷ.");
        } else {
            toast.success("Tải lên hoàn tất!");

            if (msg.documents && Array.isArray(msg.documents)) {
                setItemPage(prev => ({
                    ...prev,
                    items: [...msg.documents, ...prev.items], // thêm vào đầu danh sách
                    totalItems: prev.totalItems + msg.documents.length
                }));
            }
        }

        setTimeout(() => setUploadProgress(null), 2000);
        webSocketService.unsubscribeUploadProgress();
        webSocketService.unsubscribeUploadCompleted();
    }, []);

    useEffect(() => {
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);
        webSocketService.connect(handleMessage);
        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
            webSocketService.disconnect();
        };
    }, [handleDragOver, handleDragLeave, handleDrop, handleMessage]);

    const handleLoadMore = () => {
        if (itemPage.hasNext) setPageNo(prev => prev + 1);
    };

    useEffect(() => {
        setIsLoading(true);
        getItems(pageNo, 10, items)
            .then((response) => {
                if (response.status === 200) {
                    const newItems = response.data.items;
                    setItemPage((prev) => ({
                        ...response.data,
                        items: [...prev.items, ...newItems],
                    }));
                } else {
                    toast.error(response.message);
                }
            })
            .catch(() => toast.error("Lỗi khi lấy dữ liệu"))
            .finally(() => setIsLoading(false));
    }, [pageNo, items]);

    useEffect(() => {
        setPageNo(0);
        setItemPage({
            pageNo: 0,
            pageSize: 10,
            totalPage: 0,
            hasNext: false,
            totalItems: 0,
            items: [],
        });
    }, [items]);

    return (
        <div className="relative width-full h-full flex flex-col gap-4 p-4">
            {isLoading && <FullScreenLoader />}
            <DashboardFilterBar
                layout={layout}
                setItems={setItems}
                setLayout={setLayout}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />
            {layout === "list" ? (
                <DashboardListView
                    items={itemPage.items}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            ) : (
                <DashboardGridView
                    items={itemPage.items}
                    layout={layout}
                />
            )}
            {itemPage.hasNext && (
                <div className="bottom-4 left-4">
                    <button
                        onClick={handleLoadMore}
                        className="text-primary hover:underline hover:cursor-pointer font-medium"
                    >
                        Xem thêm
                    </button>
                </div>
            )}

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-2xl font-bold border-4 border-dashed p-10 rounded-lg">
                        Thả tệp vào đây để tải lên
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-72">
                    <p className="text-sm text-primary font-semibold mb-2 truncate">
                        Đang upload: {uploadProgress.fileName}
                    </p>
                    <progress
                        className="w-full h-3"
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
        </div>
    );
};

export default DashboardPage;
