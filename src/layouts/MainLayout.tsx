import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { PageResponse } from "../types/PageResponse";
import { ItemResponse } from "../types/ItemResponse";
import webSocketService from "../services/WebSocketService";
import { toast } from "sonner";
import api from "../utils/api";
import { uploadEmptyParent, uploadWithParent } from "../services/DocumentApi";
import { UploadProgress } from "../components/UploadProgress";
import { ItemContext } from "../contexts/ItemContext";
import { createFolder } from "../services/FolderApi";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const [activeMenu, setActiveMenu] = useState<string>("Tài liệu của tôi");
    const [items, setItems] = useState<string[]>([]);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [folderId, setFolderId] = useState<number | null>(null);// id của thư mục sẽ upload vào
    const folderIdRef = useRef<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messageProcessing, setMessageProcessing] = useState<string | null>(null);
    const onCancelRef = useRef<() => void>(() => {
    });
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
    const handleUploadFailure = useCallback((message: string) => {
        const msg = JSON.parse(message);
        if (msg.content) {
            toast.warning(msg.content);
        }
        setTimeout(() => setUploadProgress(null), 2000);
        webSocketService.unsubscribeUploadProgress();
        webSocketService.unsubscribeUploadSuccess();
        webSocketService.unsubscribeUploadFailure();
    }, []);
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
            webSocketService.unsubscribeUploadSuccess();
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
        webSocketService.unsubscribeUploadSuccess();
    }, []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    }
    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        webSocketService.subscribeUploadProgress(handleMessage);
        webSocketService.subscribeUploadSuccess(handleUploadCompleted);
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
                webSocketService.unsubscribeUploadSuccess();
            }
        } catch (err) {
            toast.error("Tải tệp thất bại.");
            webSocketService.unsubscribeUploadProgress();
            webSocketService.unsubscribeUploadSuccess();
        }
    };
    const [isDragging, setIsDragging] = useState(false);
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
        webSocketService.subscribeUploadSuccess(handleUploadCompleted);
        webSocketService.subscribeUploadFailure(handleUploadFailure);

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
                webSocketService.unsubscribeUploadSuccess();
            }
        } catch (err) {
            toast.error("Tải tệp thất bại.");
            webSocketService.unsubscribeUploadProgress();
            webSocketService.unsubscribeUploadSuccess();
        }
    }, [handleMessage, handleUploadCompleted, handleUploadFailure]);
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
    const [pageNo, setPageNo] = useState(0);
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
    const [isCreateFolder, setIsCreateFolder] = useState<boolean>(false);
    const openCreateFolderModal = () => {
        setIsCreateFolder(true);
    };

    const [newFolderName, setNewFolderName] = useState<string>(""); // Tên thư mục mới
    const handleCreateFolder = () => {
        createFolder({ name: newFolderName, folderParentId: folderIdRef.current }).then((res) => {
            if (res.status === 201) {
                setItemPage(prev => ({
                    ...prev,
                    items: [{ ...res.data }, ...prev.items], // thêm vào đầu danh sách
                    totalItems: prev.totalItems + 1
                }));
            }
        }).catch(err => {
            toast.error("Tạo thư mục thất bại.");
        }).finally(() => {
            setIsCreateFolder(false);
            setNewFolderName("");
        });
    }
    const onCancelNotificationBottomLeft = () => {
        onCancelRef.current();
    };
    const [activeLink, setActiveLink] = useState<string>("");
    const location = useLocation();
    useEffect(() => {
        setActiveLink(location.pathname);
        setItems([]);
    }, [location.pathname])
    return (
        <ItemContext.Provider
            value={{
                items,
                setItems,
                itemPage,
                pageNo,
                setItemPage,
                setPageNo,
                folderId,
                setFolderId,
                isProcessing,
                isDragging,
                setIsDragging,
                setIsProcessing,
                messageProcessing,
                setMessageProcessing,
                onCancelRef,
                triggerFileUpload,
                handleDrop,
                handleDragOver,
                handleDragLeave,
                handleUploadFailure,
                openCreateFolderModal,
                isCreateFolder,
                setIsCreateFolder,
                newFolderName,
                setNewFolderName,
                handleCreateFolder,
                onCancelNotificationBottomLeft,
                setActiveLink,
                activeLink
            }}
        >
            <div className="flex h-screen relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilesSelected}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    multiple
                    className="hidden"
                />
                <Sidebar setActiveMenu={setActiveMenu} />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Header activeMenu={activeMenu} />
                    <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative custom-scrollbar">
                        {children}
                    </main>
                </div>
                {uploadProgress && (
                    <UploadProgress
                        fileName={uploadProgress.fileName}
                        percent={uploadProgress.percent}
                        currentChunk={uploadProgress.currentChunk}
                        total={uploadProgress.total}
                        onCancel={handleCancelUpload}
                    />
                )}
            </div>
        </ItemContext.Provider>
    );
};

export default MainLayout;
