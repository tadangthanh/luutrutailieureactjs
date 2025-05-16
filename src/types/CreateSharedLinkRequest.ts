export interface CreateSharedLinkRequest {
    itemId: number;
    expiresAt?: string; // ISO date string
    maxViews?: number;
}