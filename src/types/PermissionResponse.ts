export interface PermissionResponse {
    id: number;
    permission: "VIEWER" | "EDITOR";
    email: string;
    userId: number;
}