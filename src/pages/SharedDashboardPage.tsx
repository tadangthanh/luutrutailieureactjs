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

const SharedDashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [pageNo, setPageNo] = useState<number>(0);
    const [items, setItems] = useState<string[]>([]);
    const [itemPage, setItemPage] = useState<PageResponse<ItemResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });

    // Lấy danh sách tài liệu đã chia sẻ
    useEffect(() => {
        setIsLoading(true);
        getItems(pageNo, 20, [...items, "shared:true"])
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

    const handleLoadMore = () => {
        if (itemPage.hasNext) setPageNo(prev => prev + 1);
    };

    const handleOpen = (id: number) => {
        window.open(`${process.env.REACT_APP_URL_EDITOR}/${id}`, "_blank");
    };

    const handleRename = (id: number) => {
        setRenamingItemId(id);
        setNewName(itemPage.items.find(item => item.id === id)?.name || "");
    };

    const handleCopy = (id: number) => {
        setOpenMenuId(null);
        showNotificationBottomLeft("Đang tạo bản sao...", () => {
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
                        items: [{ ...res.data }, ...prev.items],
                        totalItems: prev.totalItems + 1
                    }));
                } else {
                    toast.error("Sao chép tài liệu thất bại.");
                }
            }).finally(() => {
                hiddenNotificationBottomLeft();
            });
        }, 3000);
    };

    const handleDownload = (id: number) => {
        setOpenMenuId(null);
        showNotificationBottomLeft("Đang chuẩn bị tải xuống...", () => {
            if (downloadTimeoutRef.current) {
                clearTimeout(downloadTimeoutRef.current);
                downloadTimeoutRef.current = null;
                hiddenNotificationBottomLeft();
            }
        });
        downloadTimeoutRef.current = setTimeout(() => {
            downloadFolder(id)
                .catch((err) => toast.error("Tải xuống thất bại"))
                .finally(() => {
                    hiddenNotificationBottomLeft();
                    downloadTimeoutRef.current = null;
                });
        }, 3000);
    };

    const handleShare = (id: number) => {
        setOpenMenuId(null);
        setIdItemToShare(id);
        setOpenShareDialog(true);
    };

    const handleInfo = (id: number) => {
        setIsInfoLoading(true);
        setInfoItem(itemPage.items.find(item => item.id === id) || null);
        setIsInfoLoading(false);
    };

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
        });
    };

    const [renamingItemId, setRenamingItemId] = useState<number | null>(null);
    const [newName, setNewName] = useState<string>("");
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [idItemToShare, setIdItemToShare] = useState<number | null>(null);
    const [infoItem, setInfoItem] = useState<ItemResponse | null>(null);
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messageProcessing, setMessageProcessing] = useState<string | null>(null);
    const onCancelRef = useRef<() => void>(() => { });
    const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showNotificationBottomLeft = (message: string, onCancel: () => void) => {
        setIsProcessing(true);
        setMessageProcessing(message);
        onCancelRef.current = onCancel;
    };

    const hiddenNotificationBottomLeft = () => {
        setIsProcessing(false);
        setMessageProcessing(null);
        onCancelRef.current = () => { };
    };

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
            });
        } catch (error) {
            toast.error("Đổi tên thất bại.");
        } finally {
            setRenamingItemId(null);
            setNewName("");
        }
    };

    const handleItemClick = (item: ItemResponse) => {
        handleOpen(item.id);
    };

    const onCancelNotificationBottomLeft = () => {
        onCancelRef.current();
    };

    const handleVersionHistory = (id: number) => {
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

            <div className="mb-4">
                <h1 className="text-2xl font-bold text-secondary">Tài liệu đã chia sẻ</h1>
                <p className="text-gray-600">Danh sách các tài liệu mà bạn đã chia sẻ với người khác</p>
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
                            handleVersionHistory={handleVersionHistory}
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

export default SharedDashboardPage; 