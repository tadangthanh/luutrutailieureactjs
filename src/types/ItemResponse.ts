import { BaseDto } from "./BaseDto";

export interface ItemResponse extends BaseDto {
    id: number;
    name: string;
    parentId: number | null;
    description: string;
    ownerName: string;
    ownerEmail: string;
    deletedAt: string | null;
    itemType: "DOCUMENT" | "FOLDER";
    saved: boolean;
    size: number | null; // Size in bytes, null for folders
    isSharedWithMe: boolean;
}