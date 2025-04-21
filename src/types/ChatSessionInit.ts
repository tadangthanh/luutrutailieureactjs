import { AssistantFile } from "./AssistantFile";
import { Conversation } from "./Conversation";

export interface ChatSessionInit {
    name: string;
    assistantFiles: AssistantFile[];
    conversation: Conversation
}