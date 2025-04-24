import { BaseDto } from "./BaseDto";

export interface ResourceResponse extends BaseDto {
    id: number;
    name: string;
    parentId: number | null;
    description: string;
    ownerName: string;
    ownerEmail: string;
    deletedAt: string | null;
    size: number | null; // Size in bytes, null for folders
}