import { useState, useRef, useEffect } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { toast } from "sonner";
import { ItemResponse } from "../types/ItemResponse";
import { delItem, updateItem, getItems, getItemsSharedWithMe } from "../services/ItemApi";
import ShareDialog from "../components/ShareDialog";
import Breadcrumbs from "../components/Breadcrumbs";
import { copyDocument, downloadDoc, getOnlyOfficeConfig } from "../services/DocumentApi";
import BottomLeftNotification from "../components/BottomLeftNotification";
import { downloadFolder } from "../services/FolderApi";
import { AnimatePresence, motion } from "framer-motion";
import { EmptyAreaContextMenu } from "../components/EmptyAreaContextMenu";
import TextInputModal from "../components/TextInputModal";
import { ItemInfoPanel } from "../components/ItemInfoPanel";
import VersionHistoryDialog from '../components/VersionHistoryDialog';
import { DocumentVersionResponse } from "../types/DocumentVersionResponse";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { useNavigate } from "react-router-dom";
import { removeItem, saveItem } from "../services/ItemSavedApi";
import { useItemContext } from "../contexts/ItemContext";
import FullScreenLoading from "../components/FullScreenLoading";
import { hasPermissionEditor } from "../services/PermissionApi";
import { useDelayedLoading } from "../hooks/Loading";
import { DashboardProvider } from "../contexts/DashboardContext";

interface DashboardPageProps {
    isSharedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isSharedView = false }) => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [renamingItemId, setRenamingItemId] = useState<number | null>(null); // ID của item đang rename
    const [newName, setNewName] = useState<string>(""); // Giá trị tên mới
    const pathRef = useRef<Array<{ id: number; name: string }>>([
        { id: 0, name: isSharedView ? "Kho lưu trữ chia sẻ" : "Kho lưu trữ của tôi" },
    ]);
    const [messageProcessing, setMessageProcessing] = useState<string | null>(null);

    const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
    }>({ visible: false, x: 0, y: 0 });
    const { setItems, items, pageNo, openCreateFolderModal, folderId, setFolderId, itemPage, setItemPage, setPageNo, isDragging, setIsProcessing, onCancelRef, triggerFileUpload, isProcessing, onCancelNotificationBottomLeft } = useItemContext();

    const [versionHistoryItemId, setVersionHistoryItemId] = useState<number | null>(null);

    const handleLoadMore = () => {
        if (itemPage.hasNext) setPageNo((prev: number) => prev + 1);
    };

    const navigate = useNavigate();
    const handleOpen = (id: number) => {
        getOnlyOfficeConfig(Number(id))
            .then((response) => {
                if (response.status === 200) {
                    const config: OnlyOfficeConfig = response.data;
                    // Mở editor trong tab mới
                    const editorUrl = `/editor?config=${encodeURIComponent(JSON.stringify(config))}`;
                    window.open(editorUrl, '_blank');
                } else {
                    toast.error(response.message); // Hiển thị thông báo lỗi nếu không thành công
                    navigate("/"); // Điều hướng về trang chính nếu có lỗi
                }
            }).catch((error) => {
                toast.error("Lỗi khi lấy cấu hình tài liệu.");
                navigate("/"); // Điều hướng về trang chính nếu có lỗi
            })
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
            if (itemPage.items.find(item => item.id === id)?.itemType === 'FOLDER') {
                downloadFolder(id)
                    .catch((err) => toast.error("Tải xuống thất bại"))
                    .finally(() => {
                        hiddenNotificationBottomLeft();
                        downloadTimeoutRef.current = null;
                    });
            } else {
                downloadDoc(id)
                    .catch((err) => toast.error("Tải xuống thất bại"))
                    .finally(() => {
                        hiddenNotificationBottomLeft();
                        downloadTimeoutRef.current = null;
                    });
            }

        }, 3000);
    };

    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [idItemToShare, setIdItemToShare] = useState<number | null>(null); // ID của item đang chia sẻ
    const [isLoading, setIsLoading] = useState(false);
    const showLoading = useDelayedLoading(isLoading); // dùng hook

    const handleShare = (id: number) => {
        // kiem tra xem nguoi dung co quyen chinh sua hay k
        setIsLoading(true);
        hasPermissionEditor(id).then((res) => {

            if (res.status === 200) {
                if (res.data === true) {
                    setOpenMenuId(null);
                    setIdItemToShare(id);
                    setOpenShareDialog(true);
                    return;
                }
            } else {
                setIsLoading(false);
                toast.error("Bạn không có quyền chỉnh sửa tài liệu này");
            }
        }).finally(() => {
            setIsLoading(false)
        })

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = isSharedView
                    ? await getItemsSharedWithMe(pageNo, 20, items)
                    : await getItems(pageNo, 20, items);

                if (response.status === 200) {
                    if (pageNo === 0) {
                        // Nếu là trang đầu tiên, set trực tiếp
                        setItemPage(response.data);
                    } else {
                        // Nếu là trang tiếp theo, append vào
                        setItemPage((prev) => ({
                            ...response.data,
                            items: [...prev.items, ...response.data.items],
                        }));
                    }
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu");
            }
        };
        fetchData();
    }, [pageNo, items, isSharedView, setItemPage]);

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
    const [isEditor, setIsEditor] = useState(false);
    useEffect(() => {
        if (folderId) {
            hasPermissionEditor(folderId).then((res) => {
                if (res.status === 200) {
                    setIsEditor(res.data);
                }
            })
        } else {
            setIsEditor(true);
        }
    }, [folderId])
    const handleItemClick = (item: ItemResponse) => {
        if (item.itemType === 'FOLDER') {
            // 1) Set the folder
            setFolderId(item.id);
            hasPermissionEditor(item.id).then((res) => {
                if (res.status === 200) {
                    setIsEditor(res.data);
                }
            })
            // 2) Rebuild your query filters
            setItems(buildFilters(item.id));

            // 3) Maintain the crumb trail:
            //    – if already in the trail, slice back to it,
            //    – otherwise append it.
            const idx = pathRef.current.findIndex(p => p.id === item.id);
            if (idx !== -1) {
                // clicking on a folder that's already in the crumb
                pathRef.current = pathRef.current.slice(0, idx + 1);
            } else {
                pathRef.current.push({ id: item.id, name: item.name });
            }
        } else if (item.itemType === 'DOCUMENT') {
            // Handle click on document item
            handleOpen(item.id);
        }

    }

    const handleVersionHistory = (id: number) => {
        setOpenMenuId(null);
        setVersionHistoryItemId(id);
    };

    const handleRestoreSuccess = (documentId: number, version: DocumentVersionResponse) => {
        setItemPage(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === documentId) {
                    return {
                        ...item,
                        version: version.version,
                        type: version.type,
                        size: version.size,
                        updatedAt: version.updatedAt
                    };
                }
                return item;
            })
        }));
    };

    const handleSave = (id: number) => {
        saveItem(id).then((res) => {
            if (res.status === 201) {
                setItemPage(prev => ({
                    ...prev,
                    items: prev.items.map(item => item.id === id ? { ...item, saved: true } : item)
                }));
            } else {
                toast.error(res.message);
            }
        })
    }
    const handleUnSave = (id: number) => {
        removeItem(id).then((res) => {
            if (res.status === 200) {
                setItemPage(prev => ({
                    ...prev,
                    items: prev.items.map(item => item.id === id ? { ...item, saved: false } : item)
                }));
            } else {
                toast.error(res.message);
            }
        })
    }

    const dashboardContextValue = {
        isEditor,
        handleSave,
        handleUnSave,
        handleVersionHistory,
        handleItemClick,
        handleCopy,
        handleDownload,
        handleInfo,
        handleMoveToTrash,
        handleOpen,
        handleRename,
        handleShare,
        handleRestoreSuccess
    };

    return (
        <DashboardProvider value={dashboardContextValue}>
            <div
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (e.target === e.currentTarget) {
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                    }
                }}
                onClick={() => contextMenu.visible && setContextMenu({ ...contextMenu, visible: false })}
                className="relative width-full h-full flex flex-col gap-4 p-4">
                {showLoading && <FullScreenLoading />}
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
                {/* {isCreateFolder && (
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
                )} */}
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
                            onClick={handleBreadCrumbsClick}
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

                {versionHistoryItemId && (
                    <VersionHistoryDialog
                        documentId={versionHistoryItemId}
                        onClose={() => setVersionHistoryItemId(null)}
                        onRestoreSuccess={handleRestoreSuccess}
                    />
                )}


            </div>
        </DashboardProvider>
    );
};

export default DashboardPage;
