import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSavedItems, removeItem } from "../services/ItemSavedApi";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import { FileIcon, FolderIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { formatFileSize, formatDateTime } from "../utils/FormatDateTimeUtil";
import { ItemResponse } from "../types/ItemResponse";
import { useNavigate } from "react-router-dom";
import { getOnlyOfficeConfig } from "../services/DocumentApi";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";

const SavedDocumentsPage = () => {
    const [savedItems, setSavedItems] = useState<PageResponse<ItemResponse>>({
        items: [],
        totalPage: 0,
        pageNo: 0,
        pageSize: 10,
        totalItems: 0,
        hasNext: false,
    });
    const [loading, setLoading] = useState(true);

    const fetchSavedItems = async (page: number) => {
        try {
            setLoading(true);
            const response = await getSavedItems(page, 10);
            if (response) {
                setSavedItems(response.data);
            }
        } catch (error) {
            toast.error("Failed to fetch saved items");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            removeItem(itemId).then((res) => {
                if (res.status === 200) {
                    setSavedItems((prev) => ({
                        ...prev,
                        items: prev.items.filter((item) => item.id !== itemId),
                    }));
                } else {
                    toast.error(res.message);
                }
            })
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    useEffect(() => {
        fetchSavedItems(0);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3
            }
        }
    };
    const navigate = useNavigate();
    const handleItemClick = (item: ItemResponse) => () => {
        if (item.itemType === "FOLDER") {
            navigate(`/folders/${item.id}`);
        } else if (item.itemType === "DOCUMENT") {
            getOnlyOfficeConfig(item.id)
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
                    console.error("Lỗi khi lấy cấu hình OnlyOffice:", error);
                    toast.error("Lỗi khi lấy cấu hình tài liệu.");
                    navigate("/"); // Điều hướng về trang chính nếu có lỗi
                })
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
                            >
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                            </motion.div>
                        ))
                    ) : !savedItems?.items || savedItems.items.length === 0 ? (
                        <motion.div
                            variants={itemVariants}
                            className="col-span-full text-center py-12"
                        >
                            <p className="text-gray-500 dark:text-gray-400">Không có tài liệu nào được lưu</p>
                        </motion.div>
                    ) : (
                        savedItems.items.map((savedItem) => (
                            <motion.div
                                onClick={handleItemClick(savedItem)}
                                key={savedItem.id}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        {savedItem.itemType === "DOCUMENT" ? (
                                            <FileIcon className="w-6 h-6 text-blue-500" />
                                        ) : (
                                            <FolderIcon className="w-6 h-6 text-yellow-500" />
                                        )}
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-white truncate">
                                                {savedItem.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {savedItem.itemType === "DOCUMENT" && savedItem.size
                                                    ? formatFileSize(savedItem.size)
                                                    : "Thư mục"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveItem(savedItem.id)
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                    <p>Người sở hữu: {savedItem.ownerName}</p>
                                    <p>Ngày tạo: {formatDateTime(savedItem.createdAt)}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>

            {!loading && savedItems && savedItems.totalPage > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button
                        onClick={() => fetchSavedItems(savedItems.pageNo - 1)}
                        disabled={savedItems.pageNo === 0}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-gray-600 dark:text-gray-300">
                        Trang {savedItems.pageNo + 1} / {savedItems.totalPage}
                    </span>
                    <button
                        onClick={() => fetchSavedItems(savedItems.pageNo + 1)}
                        disabled={!savedItems.hasNext}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SavedDocumentsPage; 