// src/pages/TrashPage.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getTrash, restoreItem, deleteForeverItem, cleanTrash } from "../services/ItemApi";
import { PageResponse } from "../types/PageResponse";
import { ItemResponse } from "../types/ItemResponse";
import { Trash2, RotateCcw, Loader2, Folder, File, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const TrashPage = () => {
    const [itemPage, setItemPage] = useState<PageResponse<ItemResponse>>({
        items: [],
        totalPage: 0,
        pageNo: 0,
        pageSize: 10,
        totalItems: 0,
        hasNext: false,
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    useEffect(() => {
        try {
            getTrash(page, 10).then((res) => {
                if (res.status === 200) {
                    setItemPage(res.data);
                } else {
                    toast.error(res.message);
                }
            })
        } catch (error) {
            toast.error("Không thể tải danh sách thùng rác");
        } finally {
            setLoading(false);
        }
    }, [page]);

    const handleRestore = async (id: number) => {
        try {
            restoreItem(id).then((res) => {
                if (res.status === 200) {
                    toast.success("Đã khôi phục");
                    setItemPage((prev) => ({
                        ...prev,
                        items: prev.items.filter((item) => item.id !== id),
                    }));
                } else {
                    toast.error(res.message);
                }
            })
        } catch (error) {
            toast.error("Không thể khôi phục");
        }
    };

    const handleDeleteForever = async (id: number) => {
        try {
            deleteForeverItem(id).then((res) => {
                if (res.status === 200) {
                    toast.success("Đã xóa vĩnh viễn");
                    setItemPage((prev) => ({
                        ...prev,
                        items: prev.items.filter((item) => item.id !== id),
                    }));
                } else {
                    toast.error(res.message);
                }
            })
        } catch (error) {
            toast.error("Không thể xóa vĩnh viễn");
        }
    };

    const handleCleanTrash = async () => {
        toast.custom((t) => (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Xác nhận dọn sạch thùng rác
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Bạn có chắc chắn muốn dọn sạch thùng rác? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t);
                            toast.promise(
                                cleanTrash().then((res) => {
                                    if (res.status === 200) {
                                        setItemPage((prev) => ({
                                            ...prev,
                                            items: [],
                                            totalItems: 0,
                                        }));
                                        return "Đã dọn sạch thùng rác";
                                    }
                                    throw new Error(res.message);
                                }),
                                {
                                    loading: 'Đang dọn sạch thùng rác...',
                                    success: (message: string) => message,
                                    error: (error: string) => error,
                                }
                            );
                        }}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                    >
                        Dọn sạch
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: "top-center",
        });
    };

    const getItemIcon = (itemType: string) => {
        if (itemType === "FOLDER") {
            return <Folder className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
        }
        return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    };

    const getItemTypeText = (itemType: string) => {
        return itemType === "FOLDER" ? "Thư mục" : "Tài liệu";
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage <= itemPage.totalPage - 1) {
            setPage(newPage);
        }
    };

    const handleItemClick = (item: ItemResponse) => {
        toast.info("Vui lòng khôi phục mục này trước khi truy cập.");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Tổng số: {itemPage.totalItems} mục
                        </p>
                    </div>
                    {itemPage.totalItems > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCleanTrash}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Dọn sạch thùng rác
                        </motion.button>
                    )}
                </div>
            </motion.div>

            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Các mục trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày kể từ ngày xóa.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <AnimatePresence>
                    {!itemPage || itemPage.items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                            Thùng rác trống
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {itemPage.items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.itemType === "FOLDER"
                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                : "bg-gray-50 dark:bg-gray-700"
                                                }`}>
                                                {getItemIcon(item.itemType)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                                        {item.name}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.itemType === "FOLDER"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                                        }`}>
                                                        {getItemTypeText(item.itemType)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Đã xóa vào: {new Date(item.deletedAt || '').toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleRestore(item.id)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                                                title="Khôi phục"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteForever(item.id);
                                                }}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {itemPage.totalPage > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex justify-center items-center gap-2"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className={`p-2 rounded-lg ${page === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Trang {page + 1} / {itemPage.totalPage}
                    </span>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === itemPage.totalPage - 1}
                        className={`p-2 rounded-lg ${page === itemPage.totalPage - 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default TrashPage;