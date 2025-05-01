import { useEffect, useState, useCallback, useRef } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import { ItemResponse } from "../types/ItemResponse";
import { delItem, getItems, updateItem } from "../services/ItemApi";
import api from "../utils/api";
import webSocketService from "../services/WebSocketService";
import ShareDialog from "../components/ShareDialog";
import Breadcrumbs from "../components/Breadcrumbs";
import { copyDocument, uploadEmptyParent, uploadWithParent } from "../services/DocumentApi";
import BottomLeftNotification from "../components/BottomLeftNotification";
import { createFolder, downloadFolder } from "../services/FolderApi";
import { AnimatePresence, motion } from "framer-motion";
import { EmptyAreaContextMenu } from "../components/EmptyAreaContextMenu";
import TextInputModal from "../components/TextInputModal";
import { UploadProgress } from "../components/UploadProgress";
import { ItemInfoPanel } from "../components/ItemInfoPanel";
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
    const pathRef = useRef<Array<{ id: number; name: string }>>([
        { id: 0, name: 'Kho lưu trữ của tôi' },
    ]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [messageProcessing, setMessageProcessing] = useState<string | null>(null);
    const onCancelRef = useRef<() => void>(() => {
    });
    const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const onCancelNotificationBottomLeft = () => {
        onCancelRef.current();
    };
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
    }>({ visible: false, x: 0, y: 0 });

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
        // setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: any) => {
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
    }, [handleMessage]);
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
        getItems(pageNo, 20, items)
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
        // Mở tài liệu trong tab mới bằng URL tương ứng
        window.open(`${process.env.REACT_APP_URL_EDITOR}/${id}`, "_blank");
    }
    const handleRename = (id: number) => {
        setRenamingItemId(id);
        setNewName(itemPage.items.find(item => item.id === id)?.name || "");
    };

    const showNotificationBottomLeft = (message: string, onCancel: () => void) => {
        setIsProcessing(true);
        setMessageProcessing(message);
        onCancelRef.current = onCancel;
    }
    const hiddenNotificationBottomLeft = () => {
        setIsProcessing(false);
        setMessageProcessing(null);
        onCancelRef.current = () => { };
    }
    const handleCopy = (id: number) => {
        setOpenMenuId(null);
        // Bắt đầu thông báo
        showNotificationBottomLeft("Đang tạo bản sao...", () => {
            // Nếu người dùng bấm Hủy
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
                copyTimeoutRef.current = null;
                hiddenNotificationBottomLeft();
            }
        });
        copyTimeoutRef.current = setTimeout(() => {
            copyDocument(id).then((res) => {
                if (res.status === 201) {
                    setItemPage(prev => ({
                        ...prev,
                        items: [{ ...res.data }, ...prev.items], // thêm vào đầu danh sách
                        totalItems: prev.totalItems + 1
                    }));
                } else {
                    toast.error("Sao chép tài liệu thất bại.");
                }
            }).finally(() => {
                hiddenNotificationBottomLeft()
            });
        }, 3000);


    }
    const handleDownload = (id: number) => {
        setOpenMenuId(null);
        // Bắt đầu thông báo
        showNotificationBottomLeft("Đang chuẩn bị tải xuống...", () => {
            // Nếu người dùng bấm Hủy
            if (downloadTimeoutRef.current) {
                clearTimeout(downloadTimeoutRef.current);
                downloadTimeoutRef.current = null;
                hiddenNotificationBottomLeft();
            }
        });

        // Đặt timeout 3 giây để thực hiện download
        downloadTimeoutRef.current = setTimeout(() => {
            downloadFolder(id)
                .catch((err) => toast.error("Tải xuống thất bại"))
                .finally(() => {
                    hiddenNotificationBottomLeft();
                    downloadTimeoutRef.current = null;
                });
        }, 3000);
    };
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [idItemToShare, setIdItemToShare] = useState<number | null>(null); // ID của item đang chia sẻ
    const handleShare = (id: number) => {
        setOpenMenuId(null);
        setIdItemToShare(id);
        setOpenShareDialog(true);
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


    const handleMoveToTrash = (id: number) => {
        delItem(id).then((res) => {
            if (res.status === 200) {
                toast.success("Đã chuyển vào thùng rác");
                setItemPage(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item.id !== id),
                    totalItems: prev.totalItems - 1
                }));
            } else {
                toast.error(res.message);
            }
        })
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

    const buildFilters = (parentId: number | null) =>
        (prev: string[]) => {
            const base = prev.filter(i => !i.startsWith('parent.id:'));
            return parentId != null ? [...base, `parent.id:${parentId}`] : base;
        };

    const handleBreadCrumbsClick = (id: number) => {
        // 1) Set the folder (null for root)
        setFolderId(id === 0 ? null : id);

        // 2) Trim the crumb trail to the clicked one
        const idx = pathRef.current.findIndex(p => p.id === id);
        if (idx !== -1) {
            pathRef.current = pathRef.current.slice(0, idx + 1);
        }

        // 3) Rebuild your query filters
        setItems(buildFilters(id === 0 ? null : id));
    }
    const handleItemClick = (item: ItemResponse) => {
        if (item.itemType === 'FOLDER') {
            // 1) Set the folder
            setFolderId(item.id);

            // 2) Rebuild your query filters
            setItems(buildFilters(item.id));

            // 3) Maintain the crumb trail:
            //    – if already in the trail, slice back to it,
            //    – otherwise append it.
            const idx = pathRef.current.findIndex(p => p.id === item.id);
            if (idx !== -1) {
                // clicking on a folder that’s already in the crumb
                pathRef.current = pathRef.current.slice(0, idx + 1);
            } else {
                pathRef.current.push({ id: item.id, name: item.name });
            }
        } else if (item.itemType === 'DOCUMENT') {
            // Handle click on document item
            handleOpen(item.id);
        }

    }

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
    return (
        <div
            onContextMenu={(e) => {
                e.preventDefault();
                // Check nếu click vào vùng rỗng (not item)
                if (e.target === e.currentTarget) {
                    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                }
            }}
            onClick={() => contextMenu.visible && setContextMenu({ ...contextMenu, visible: false })}
            className="relative width-full h-full flex flex-col gap-4 p-4">
            {contextMenu.visible && (
                <EmptyAreaContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onSelect={(action: any) => {
                        if (action === "newFolder") openCreateFolderModal();
                        else if (action === "uploadFile") triggerFileUpload();
                        setContextMenu({ ...contextMenu, visible: false });
                    }}
                />
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesSelected}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                multiple
                className="hidden"
            />
            {isCreateFolder && (
                <TextInputModal
                    title="Tạo thư mục mới"
                    inputValue={newFolderName}
                    setInputValue={setNewFolderName}
                    onCancel={() => {
                        setIsCreateFolder(false);
                        setNewFolderName("");
                    }}
                    onConfirm={handleCreateFolder}
                    confirmText="Lưu"
                    placeholder="Nhập tên thư mục"
                />
            )}
            {isLoading && <FullScreenLoader />}
            <DashboardFilterBar
                layout={layout}
                setItems={setItems}
                setLayout={setLayout}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />
            <div>
                {pathRef.current && pathRef.current.length > 1 && (
                    <Breadcrumbs
                        initialPath={pathRef.current}
                        onClick={handleBreadCrumbsClick} // Cập nhật path khi click vào link
                    />
                )}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={layout}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
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
                            onClick={handleItemClick}
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
                </motion.div>
            </AnimatePresence>
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
                <TextInputModal
                    title="Đổi tên"
                    inputValue={newName}
                    setInputValue={setNewName}
                    onCancel={() => {
                        setRenamingItemId(null);
                        setNewName("");
                    }}
                    onConfirm={handleConfirmRename}
                    confirmText="Lưu"
                    placeholder="Nhập tên mới"
                />
            )}


            {/* Upload Progress */}
            {uploadProgress && (
                <UploadProgress
                    fileName={uploadProgress.fileName}
                    percent={uploadProgress.percent}
                    currentChunk={uploadProgress.currentChunk}
                    total={uploadProgress.total}
                    onCancel={handleCancelUpload}
                />
            )}

            {openShareDialog && (
                <ShareDialog
                    onClose={() => setOpenShareDialog(false)}
                    idItemToShare={idItemToShare}
                />
            )}
            {infoItem && (
                <ItemInfoPanel
                    item={infoItem}
                    isLoading={isInfoLoading}
                    onClose={() => setInfoItem(null)}
                />
            )}
            {isProcessing && (
                <BottomLeftNotification
                    message={messageProcessing || ""}
                    onCancel={onCancelNotificationBottomLeft}
                />
            )}

        </div>
    );
};

export default DashboardPage;
