export interface PermissionRequest {
    recipientId: number;
    permission: "viewer" | "editor";
}