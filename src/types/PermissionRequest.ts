export interface PermissionRequest {
    recipientId: number;
    permission: "VIEWER" | "EDITOR";
}