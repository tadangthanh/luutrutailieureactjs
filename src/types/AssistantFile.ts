export interface AssistantFile {
    id: number;
    name: string;
    originalFileName: string;
    expirationTime: Date | null;
    createTime: Date | null;
    chatSessionId: number;
}