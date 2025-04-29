import { useEffect, useState, useCallback, useRef } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import { ItemResponse } from "../types/ItemResponse";
import { getItems, updateItem } from "../services/ItemApi";
import api from "../utils/api";
import webSocketService from "../services/WebSocketService";
import ResizableSlidePanel from "../components/ResizableSlidePanel";
import ShareDialog from "../components/ShareDialog";
import Breadcrumbs from "../components/Breadcrumbs";
import { uploadEmptyParent, uploadWithParent } from "../services/DocumentApi";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [pageNo, setPageNo] = useState<number>(0);
    const [items, setItems] = useState<string[]>([]);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [renamingItemId, setRenamingItemId] = useState<number | null>(null); // ID của item đang rename
    const [newName, setNewName] = useState<string>(""); // Giá trị tên mới
    const [folderId, setFolderId] = useState<number | null>(null);// id của thư mục sẽ upload vào
    const folderIdRef = useRef<number | null>(null);

    useEffect(() => {
        folderIdRef.current = folderId;
    }, [folderId]);
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
            let res;
            if (folderIdRef.current) {
                res = await uploadWithParent(folderIdRef.current, formData);
            } else {
                res = await uploadEmptyParent(formData);
            }
            if (res.status === 200) {
                setUploadId(res.data);
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

    const handleOpen = (id: number) => {
        console.log(`Opening item with id: ${id}`);
    }
    const handleRename = (id: number) => {
        setRenamingItemId(id);
        setNewName(itemPage.items.find(item => item.id === id)?.name || "");
    };

    const handleDownload = (id: number) => {
        console.log(`Downloading item with id: ${id}`);
    }
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [idItemToShare, setIdItemToShare] = useState<number | null>(null); // ID của item đang chia sẻ
    const handleShare = (id: number) => {
        setOpenMenuId(null);
        setIdItemToShare(id);
        setOpenShareDialog(true);
    }
    function formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');     // Ngày
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (getMonth() trả về từ 0-11)
        const year = date.getFullYear();                         // Năm
        const hours = String(date.getHours()).padStart(2, '0');   // Giờ
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Phút

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    const [infoItem, setInfoItem] = useState<ItemResponse | null>(null);
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const handleInfo = (id: number) => {
        setIsInfoLoading(true);
        // Gọi API nếu cần fetch thêm info
        // const detail = await fetchItemInfo(item.id); // <-- API của bạn
        setInfoItem(itemPage.items.find(item => item.id === id) || null);
        setIsInfoLoading(false);
    }
    const handleCopy = (id: number) => {
        console.log(`Copying item with id: ${id}`);
    }
    const handleMoveToTrash = (id: number) => {
        console.log(`Moving item with id: ${id} to trash`);
    }
    const handleConfirmRename = async () => {
        try {
            const isChangeName = newName.trim() !== itemPage.items.find(item => item.id === renamingItemId)?.name;
            if (!renamingItemId || !isChangeName) return;
            updateItem(renamingItemId, { name: newName }).then((res) => {
                if (res.status === 200) {
                    setItemPage(prev => ({
                        ...prev,
                        items: prev.items.map(item => item.id === renamingItemId ? { ...item, name: newName } : item)
                    }));
                } else {
                    toast.error("Đổi tên thất bại.");
                }
            })
        } catch (error) {
            toast.error("Đổi tên thất bại.");
        } finally {
            setRenamingItemId(null);
            setNewName("");
        }
    };

    const [path, setPath] = useState<{ id: number, name: string }[]>([
    ]);
    const handleBreadCrumbsClick = (id: number) => {
        if (id === 0) {
            setPath([]);
            setItems((prev: string[]) => {
                const filteredItems = prev.filter(item => !item.startsWith("parent.id:"));
                return filteredItems;
            })
        } else {
            setItems([...items, `parent.id:${id}`])
        }
    }
    const handleItemClick = (item: ItemResponse) => {
        console.log("asdas")
        if (item.itemType === "FOLDER") {
            setFolderId(item.id);
            setItems([...items, `parent.id:${item.id}`])
            if (path.length === 0) {
                setPath((prev: any) => {
                    return [...prev, { id: 0, name: "Trang chủ" }, { id: item.id, name: item.name }];
                });
            } else {
                setPath((prev: any) => {
                    return [...prev, { id: item.id, name: item.name }];
                });
            }
        }
    }
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
            <div>
                {path && path.length > 1 && (
                    <Breadcrumbs
                        initialPath={path}
                        onClick={handleBreadCrumbsClick} // Cập nhật path khi click vào link
                    />
                )}
            </div>
            {layout === "list" ? (
                <DashboardListView
                    onClick={handleItemClick}
                    items={itemPage.items}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    handleCopy={handleCopy}
                    handleDownload={handleDownload}
                    handleInfo={handleInfo}
                    handleMoveToTrash={handleMoveToTrash}
                    handleOpen={handleOpen}
                    handleRename={handleRename}
                    handleShare={handleShare}
                />
            ) : (
                <DashboardGridView
                    items={itemPage.items}
                    layout={layout}
                    handleCopy={handleCopy}
                    handleDownload={handleDownload}
                    handleInfo={handleInfo}
                    handleMoveToTrash={handleMoveToTrash}
                    handleOpen={handleOpen}
                    handleRename={handleRename}
                    handleShare={handleShare}
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
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none animate-fadeIn">
                    <div className="text-white text-2xl font-bold border-4 border-dashed border-white p-10 rounded-2xl animate-zoomIn">
                        Thả tệp vào đây để tải lên
                    </div>
                </div>

            )}
            {renamingItemId && (
                <div className="absolute inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[300px]">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Đổi tên</h2>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setRenamingItemId(null);
                                    setNewName("");
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleConfirmRename()}
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded"
                            >
                                Lưu
                            </button>
                        </div>
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
            {openShareDialog && (
                <ShareDialog
                    onClose={() => setOpenShareDialog(false)}
                    idItemToShare={idItemToShare}
                />
            )}
            {infoItem && (
                <ResizableSlidePanel onClose={() => setInfoItem(null)}>
                    {isInfoLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                        </div>
                    ) : (
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                            <div><strong>Tên:</strong> {infoItem.name}</div>
                            <div><strong>Loại:</strong> {infoItem.itemType === "DOCUMENT" ? "Tài liệu" : "Thư mục"}</div>
                            <div><strong>Ngày tạo:</strong> {formatDateTime(infoItem.createdAt)}</div>
                            <div><strong>Ngày sửa:</strong> {formatDateTime(infoItem.updatedAt)}</div>
                        </div>
                    )}
                </ResizableSlidePanel>
            )}

        </div>
    );
};

export default DashboardPage;
