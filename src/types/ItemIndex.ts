import { BaseDto } from "./BaseDto";

export interface ItemIndex extends BaseDto {
    itemId: number;
    name: string;
    docType: string;
    itemType: "DOCUMENT" | "FOLDER";
    content: string;
    ownerId: number;
}
