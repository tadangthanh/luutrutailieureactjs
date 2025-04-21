import { ChatSessionDto } from "../types/ChatSessionDto";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const createChatSession = async (chatSession: ChatSessionDto) => {
    return await api.post(`${apiUrl}/chat-session`, chatSession);
}
export const delChatSession = async (id: string) => {
    return await api.delete(`${apiUrl}/chat-session/${id}`);
}
export const getChatSessions = async (page = 0, size = 10) => {
    return await api.get(`${apiUrl}/chat-session?page=${page}&size=${size}`);
}