export interface Conversation {
    id?: number;
    question: string;
    answer?: string;
    assistantFileId: number;
}