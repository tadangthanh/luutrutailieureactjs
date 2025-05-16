import { BaseDto } from "./BaseDto";

export interface SharedLinkResponse extends BaseDto {
    itemId: number;
    accessToken: string;
    expiresAt: Date;
    maxViews: number;
    currentViews: number;
    isActive: boolean;
}