import { Conversation } from "../types/Conversation";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const getConversations = async (assistantFileId: number) => {
    return await api.get(`${apiUrl}/conversation/all/assistant-file/${assistantFileId}`);
};
export const addConversation = async (body: Conversation) => {
    return await api.post(`${apiUrl}/conversation`, body);
}