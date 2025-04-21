export interface Conversation {
    id: number | null;
    question: string;
    answer: string;
    chatSessionId: number | null;
}