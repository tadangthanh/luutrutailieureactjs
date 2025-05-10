import React, { useEffect, useState } from "react";
import { UserPlus, Trash2, Loader2, Settings } from "lucide-react";
import { PermissionResponse } from "../types/PermissionResponse";
import { PageResponse } from "../types/PageResponse";
import { UserIndexResponse } from "../types/UserIndexResponse";
import { getPagePermissionByItemId, saveOrUpdateBatch } from "../services/PermissionApi";
import { searchUser } from "../services/UserSearchApi";
import { useDebounce } from "use-debounce"; // <== thêm
import { User } from "../types/User";
import { toast } from "sonner";
import { PendingPermission } from "../types/PendingPermission";
import { AnimatePresence, motion } from "framer-motion";

interface ShareDialogProps {
    onClose: () => void;
    idItemToShare: number | null;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ onClose, idItemToShare }) => {
    const [email, setEmail] = useState("");
    const [debouncedEmail] = useDebounce(email, 400); // <== thêm debounce
    const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
    const [permissionPage, setPermissionPage] = useState<PageResponse<PermissionResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });
    const [suggestUserPage, setSuggestUserPage] = useState<PageResponse<UserIndexResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [userSelected, setUserSelected] = useState<User | null>(null);
    const [pendingPermissions, setPendingPermissions] = useState<PendingPermission[]>([]);
    const [pageNoPermission, setPageNoPermission] = useState(0);
    const [pageNoSuggest, setPageNoSuggest] = useState(0);



    useEffect(() => {
        if (!debouncedEmail || userSelected) {
            setSuggestUserPage({
                pageNo: 0,
                pageSize: 10,
                totalPage: 0,
                hasNext: false,
                totalItems: 0,
                items: [],
            });
            return;
        }
        fetchSuggestUsers(debouncedEmail);
    }, [debouncedEmail]);

    const fetchSuggestUsers = async (query: string) => {
        try {
            setLoadingSuggest(true);
            const res = await searchUser(query, pageNoSuggest, 50);

            // Lấy danh sách userId đã có trong permissionPage và pendingPermissions
            const existingUserIds = new Set([
                ...permissionPage.items.map(p => p.userId),
                ...pendingPermissions.map(p => p.recipientId && !p.isDelete)
            ]);

            // Lọc ra những user chưa có trong existingUserIds
            const filteredItems = (res?.data.items || []).filter((user: any) =>
                !existingUserIds.has(Number(user.user.id))
            );

            setSuggestUserPage(prev => ({
                ...res.data,
                items: [...prev.items, ...filteredItems], // nối thêm item mới
            }));

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSuggest(false);
        }
    };

    useEffect(() => {
        if (!idItemToShare) return;
        try {
            setLoadingPermissions(true);
            getPagePermissionByItemId(idItemToShare, pageNoPermission, 10)
                .then(res => {
                    if (res.status === 200) {
                        setPermissionPage(res.data);
                    } else {
                        toast.error(res.message);
                    }

                })
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPermissions(false);
        }
    }, [pageNoPermission, idItemToShare])
    useEffect(() => {
        fetchSuggestUsers(email);
    }, [pageNoSuggest])


    const handleSelectUser = (user: UserIndexResponse) => {
        setEmail(user.user.email);
        const userSelected = { ...user.user, id: +user.user.id, totalDocuments: 0, createdBy: "", createdAt: "", updatedBy: "", updatedAt: "" }
        setUserSelected(userSelected);
        setSuggestUserPage({
            pageNo: 0,
            pageSize: 10,
            totalPage: 0,
            hasNext: false,
            totalItems: 0,
            items: [],
        });
    };

    const handleAddPermission = async () => {
        if (!idItemToShare || !userSelected) return;
        try {
            setPendingPermissions((prev) => [
                ...prev,
                {
                    recipientId: userSelected.id,
                    permission: permission,
                }
            ]);
            setPermissionPage((prev) => ({
                ...prev,
                items: [...prev.items, { id: 0, userId: userSelected.id, email: userSelected.email, permission: permission }],
            }));
        } catch (err) {
            toast.error("Có lỗi xảy ra");
        } finally {
            setEmail("");
            setPermission("viewer");
            setUserSelected(null);
        }
    };

    const handleChangePermission = async (p: PermissionResponse, newPermission: "viewer" | "editor") => {
        try {
            setPermissionPage((prev) => {
                const updatedItems = prev.items.map((item) => {
                    if (item.userId === p.userId) {
                        return { ...item, permission: newPermission };
                    }
                    return item;
                });
                return { ...prev, items: updatedItems };
            })
            setPendingPermissions((prev) => {
                // Kiểm tra xem permission này đã có trong pending chưa
                const existingPending = prev.find(p1 => p1.recipientId === p.userId);
                if (existingPending) {
                    // Nếu có, cập nhật permission hiện tại
                    return prev.map(p1 =>
                        p1.recipientId === p.userId
                            ? { ...p1, permission: newPermission }
                            : p1
                    );
                }
                // Nếu chưa có, thêm mới
                return [...prev, { id: p.id, recipientId: p.userId, permission: newPermission }];
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemovePermission = async (p: PermissionResponse) => {
        try {
            setPermissionPage((prev) => {
                const updatedItems = prev.items.filter((item) => item.userId !== p.userId);
                return { ...prev, items: updatedItems };
            })
            setPendingPermissions((prev) => {
                const newPending = prev.filter((p1) => p1.id !== p.id);
                return [...newPending, { id: p.id, recipientId: p.userId, permission: p.permission, isDelete: true }]
            });
        } catch (err) {
            toast.error("Có lỗi xảy ra");
            console.error(err);
        }
    };
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        canChangePermissions: false,
        limitAccess: false,
    });

    const handleSettingChange = (event: any) => {
        const { name, checked } = event.target;
        setSettings((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
    };
    const handleApplyChanges = () => {
        if (idItemToShare) {
            try {
                saveOrUpdateBatch(idItemToShare, pendingPermissions).then((res) => {
                    if (res.status === 201) {
                    } else {
                        toast.error(res.message);
                    }
                })
            } catch {
                toast.error("Có lỗi xảy ra vui lòng thử lại sau");
            } finally {
                setPendingPermissions([]);
                setEmail("");
                setPermission("viewer");
                setUserSelected(null);
                onClose();
            }
        }
    }
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quyền truy cập</h2>
                        <button onClick={() => setShowSettings(true)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200">
                            <Settings size={20} />
                        </button>
                    </div>

                    {/* Input section */}
                    <div className="flex flex-col gap-4 mb-6 relative">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Nhập email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setUserSelected(null);
                                    }}
                                />
                                {loadingSuggest && (
                                    <Loader2 className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-gray-400" size={18} />
                                )}
                            </div>

                            <select
                                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
                                value={permission}
                                onChange={(e) => setPermission(e.target.value as "viewer" | "editor")}
                            >
                                <option value="viewer">Người xem</option>
                                <option value="editor">Người chỉnh sửa</option>
                            </select>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center"
                                onClick={handleAddPermission}
                            >
                                <UserPlus size={18} />
                            </button>
                        </div>

                        {/* Suggest user list */}
                        {suggestUserPage.items.length > 0 && (
                            <div className="custom-scrollbar absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                {suggestUserPage.items.map((user, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                                    >
                                        {user.user.avatarUrl ? (
                                            <img
                                                src={user.user.avatarUrl}
                                                alt={user.user.fullName}
                                                className="w-10 h-10 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                                    {user.user.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="font-medium text-gray-900 dark:text-white truncate"
                                                dangerouslySetInnerHTML={{ __html: user.highlights?.fullName?.[0] || user.user.fullName }}
                                            />
                                            <div
                                                className="text-sm text-gray-600 dark:text-gray-400 truncate"
                                                dangerouslySetInnerHTML={{ __html: user.highlights?.email?.[0] || user.user.email }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {suggestUserPage.hasNext && (
                                    <div
                                        className="text-blue-600 dark:text-blue-400 text-center py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                        onClick={() => setPageNoSuggest((pre) => pre + 1)}
                                    >
                                        Xem thêm
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Shared users list */}
                    <div className="space-y-3 mb-16">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Người đã chia sẻ</h3>
                        {loadingPermissions ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="animate-spin text-gray-400" size={20} />
                            </div>
                        ) : permissionPage.items.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-4">Chưa chia sẻ với ai</p>
                        ) : (
                            permissionPage.items.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <span className="text-gray-700 dark:text-gray-200 truncate block">{p.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={p.permission}
                                            onChange={(e) => handleChangePermission(p, e.target.value as "viewer" | "editor")}
                                        >
                                            <option value="viewer">Người xem</option>
                                            <option value="editor">Người chỉnh sửa</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemovePermission(p)}
                                            className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bottom actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent rounded-b-xl">
                        <div className="flex justify-end">
                            <button
                                onClick={handleApplyChanges}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm font-medium"
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Settings dialog */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={handleSettingsClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Chế độ cài đặt</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="canChangePermissions"
                                        checked={settings.canChangePermissions}
                                        onChange={handleSettingChange}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                    <span className="text-gray-700 dark:text-gray-200">Người chỉnh sửa có thể thay đổi quyền và chia sẻ</span>
                                </label>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSettingsClose}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm font-medium"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default ShareDialog;
