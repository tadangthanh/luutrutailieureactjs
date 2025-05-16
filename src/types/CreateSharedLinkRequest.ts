export interface CreateSharedLinkRequest {
    itemId: number;
    expiresAt?: Date;
    maxViews?: number;
}