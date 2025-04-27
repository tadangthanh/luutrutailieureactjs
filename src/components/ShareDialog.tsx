import React, { useEffect, useState } from "react";
import { X, UserPlus, Trash2, Loader2 } from "lucide-react";
import { PermissionResponse } from "../types/PermissionResponse";
import { PageResponse } from "../types/PageResponse";
import { UserIndexResponse } from "../types/UserIndexResponse";
import { addPermission, getPagePermissionByItemId } from "../services/PermissionApi";
import { searchUser } from "../services/UserSearchApi";
import { useDebounce } from "use-debounce"; // <== thêm
import { User } from "../types/User";

interface ShareDialogProps {
    onClose: () => void;
    idItemToShare: number | null;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ onClose, idItemToShare }) => {
    const [email, setEmail] = useState("");
    const [debouncedEmail] = useDebounce(email, 400); // <== thêm debounce
    const [permission, setPermission] = useState<"VIEWER" | "EDITOR">("VIEWER");

    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [suggestUsers, setSuggestUsers] = useState<UserIndexResponse[]>([]);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [userSelected, setUserSelected] = useState<User | null>(null);

    useEffect(() => {
        if (!idItemToShare) return;
        fetchPermissions();
    }, [idItemToShare]);

    const fetchPermissions = async () => {
        try {
            setLoadingPermissions(true);
            const res = await getPagePermissionByItemId(idItemToShare!, 0, 50);
            setPermissions(res.data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPermissions(false);
        }
    };

    useEffect(() => {
        if (!debouncedEmail || userSelected) {
            setSuggestUsers([]);
            return;
        }
        fetchSuggestUsers(debouncedEmail);
    }, [debouncedEmail]);

    const fetchSuggestUsers = async (query: string) => {
        try {
            setLoadingSuggest(true);
            const res = await searchUser(query);
            setSuggestUsers(res?.data.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSuggest(false);
        }
    };

    const handleSelectUser = (user: UserIndexResponse) => {
        setEmail(user.user.email);
        const userSelected = { ...user.user, id: +user.user.id }
        setUserSelected(userSelected);
        setSuggestUsers([]);
    };

    const handleAddPermission = async () => {
        if (!idItemToShare || !email) return;
        console.log("Adding permission", { itemId: idItemToShare, email, permission });
        console.log(userSelected, "userSelected");
        try {

            setEmail("");
            setPermission("VIEWER");
            setUserSelected(null);
            fetchPermissions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChangePermission = async (permissionId: number, newPermission: "VIEWER" | "EDITOR") => {
        try {
            // TODO: Gọi API update permission nếu bạn có
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemovePermission = async (permissionId: number) => {
        try {
            // TODO: Gọi API xóa permission nếu bạn có
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chia sẻ tài liệu</h2>

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
                            onChange={(e) => setPermission(e.target.value as "VIEWER" | "EDITOR")}
                        >
                            <option value="VIEWER">Người xem</option>
                            <option value="EDITOR">Người chỉnh sửa</option>
                        </select>
                        <button
                            className="bg-primary hover:bg-primary-dark text-white p-2 rounded"
                            onClick={handleAddPermission}
                        >
                            <UserPlus size={18} />
                        </button>
                    </div>

                    {/* Suggest user list */}
                    {suggestUsers.length > 0 && (
                        <div className="custom-scrollbar absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-700 border rounded shadow z-50 max-h-60 overflow-auto">
                            {suggestUsers.map((user, index) => (
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
                        </div>
                    )}
                </div>

                {/* Danh sách đã chia sẻ */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {loadingPermissions ? (
                        <p className="text-gray-600 dark:text-gray-300">Đang tải...</p>
                    ) : permissions.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-300">Chưa chia sẻ với ai</p>
                    ) : (
                        permissions.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-2 border rounded dark:border-gray-700">
                                <span className="text-gray-800 dark:text-white truncate">{p.email}</span>
                                <select
                                    className="p-1 border rounded dark:bg-gray-700 dark:text-white"
                                    value={p.permission}
                                    onChange={(e) => handleChangePermission(p.id, e.target.value as "VIEWER" | "EDITOR")}
                                >
                                    <option value="VIEWER">Người xem</option>
                                    <option value="EDITOR">Người chỉnh sửa</option>
                                </select>
                                <button onClick={() => handleRemovePermission(p.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareDialog;
