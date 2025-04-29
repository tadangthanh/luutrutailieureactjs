export interface PendingPermission {
    id?: number; // Nếu có id nghĩa là đang sửa, nếu không có id là mới hoàn toàn
    recipientId: number;
    permission: "viewer" | "editor";
    isDelete?: boolean;
}
