export interface ResourceResponse {
    id: number;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    parentId: number | null;
    description: string;
    ownerName: string;
    ownerEmail: string;
    deletedAt: string | null;
    size: number | null; // Size in bytes, null for folders
}