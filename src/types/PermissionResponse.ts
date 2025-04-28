export interface PermissionResponse {
    id: number;
    permission: "viewer" | "editor";
    email: string;
    userId: number;
}