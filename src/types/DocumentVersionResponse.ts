import { BaseDto } from "./BaseDto";

export interface DocumentVersionResponse extends BaseDto {
    documentId: number;
    version: number;
    type: string;
    size: number;
    expiredAt: string;
}
