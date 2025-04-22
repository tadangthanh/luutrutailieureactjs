export interface AssistantFile {
    id: number | null;
    name: string | undefined;
    uri: string | undefined;
    originalFileName: string | undefined;
    expirationTime: string | undefined;
    createTime: string | undefined;
    chatSessionId: number | null;
    mimeType: string | undefined;
}