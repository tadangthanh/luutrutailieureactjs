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
import Pagination from "./Pagination";
import { PendingPermission } from "../types/PendingPermission";

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
        const userSelected = { ...user.user, id: +user.user.id }
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
                const newPending = prev.filter((p1) => p1.id !== p.id);
                return [...newPending, { id: p.id, recipientId: p.userId, permission: newPermission }]
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
        <>
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
                    {/* Close button */}
                    <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                        <Settings size={20} />
                    </button>

                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quyền truy cập</h2>

                    {/* Input thêm người */}
                    <div className="flex flex-col gap-2 mb-4 relative">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Nhập email"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setUserSelected(null);
                                    }}
                                />
                                {loadingSuggest && (
                                    <Loader2 className="absolute top-1/2 right-2 -translate-y-1/2 animate-spin text-gray-400" size={18} />
                                )}
                            </div>

                            <select
                                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                                value={permission}
                                onChange={(e) => setPermission(e.target.value as "viewer" | "editor")}
                            >
                                <option value="viewer">Người xem</option>
                                <option value="editor">Người chỉnh sửa</option>
                            </select>
                            <button
                                className="bg-primary hover:bg-primary-dark text-white p-2 rounded"
                                onClick={handleAddPermission}
                            >
                                <UserPlus size={18} />
                            </button>
                        </div>

                        {/* Suggest user list */}
                        {suggestUserPage.items.length > 0 && (
                            <div className="custom-scrollbar absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-700 border rounded shadow z-50 max-h-60 overflow-y-auto">
                                {suggestUserPage.items.map((user, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectUser(user)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                                    >
                                        {user.user.avatarUrl ? (
                                            <img
                                                src={user.user.avatarUrl}
                                                alt={user.user.fullName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                        )}
                                        <div className="flex-1">
                                            <div
                                                className="font-semibold text-gray-900 dark:text-white"
                                                dangerouslySetInnerHTML={{ __html: user.highlights?.fullName?.[0] || user.user.fullName }}
                                            />
                                            <div
                                                className="text-sm text-gray-600 dark:text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: user.highlights?.email?.[0] || user.user.email }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* Nút xem thêm */}
                                {suggestUserPage.hasNext && (
                                    <div
                                        className="text-primary text-center py-2 cursor-pointer hover:underline"
                                        onClick={() => setPageNoSuggest((pre) => pre + 1)} // Hàm này sẽ load thêm user
                                    >
                                        Xem thêm
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Danh sách đã chia sẻ */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {loadingPermissions ? (
                            <p className="text-gray-600 dark:text-gray-300">Đang tải...</p>
                        ) : permissionPage.items.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-300">Chưa chia sẻ với ai</p>
                        ) : (
                            permissionPage.items.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-2 border rounded dark:border-gray-700">
                                    <span className="text-gray-800 dark:text-white truncate">{p.email}</span>
                                    <select
                                        className="p-1 border rounded dark:bg-gray-700 dark:text-white"
                                        value={p.permission}
                                        onChange={(e) => handleChangePermission(p, e.target.value as "viewer" | "editor")}
                                    >
                                        <option value="viewer">Người xem</option>
                                        <option value="editor">Người chỉnh sửa</option>
                                    </select>
                                    <button onClick={() => handleRemovePermission(p)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                        <Pagination
                            currentPage={pageNoPermission + 1}
                            totalPages={permissionPage.totalPage}
                            onPageChange={(page) => {
                                setPageNoPermission(page - 1); // lưu ý mình đang dùng pageNo (bắt đầu từ 0)
                            }}
                        />
                    </div>

                    {/* Nút Xong ở dưới cùng bên phải */}
                    <button
                        onClick={handleApplyChanges}
                        className="absolute bottom-4 right-4 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
                    >
                        Xong
                    </button>
                </div>
            </div>

            {/* Cửa sổ Cài đặt */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={handleSettingsClose}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chế độ cài đặt</h3>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="canChangePermissions"
                                    checked={settings.canChangePermissions}
                                    onChange={handleSettingChange}
                                    className="rounded"
                                />
                                <span className="text-white/80">Người chỉnh sửa có thể thay đổi quyền và chia sẻ</span>
                            </label>
                            {/* <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="limitAccess"
                                    checked={settings.limitAccess}
                                    onChange={handleSettingChange}
                                    className="rounded"
                                />
                                <span className="text-white/80">Giới hạn quyền truy cập, một số người có thể mất quyền truy cập. Chỉ chủ sở hữu và những người được thêm trực tiếp vào thư mục này mới có thể mở thư mục</span>
                            </label> */}
                        </div>
                        <button
                            onClick={handleSettingsClose}
                            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded mt-4"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareDialog;
