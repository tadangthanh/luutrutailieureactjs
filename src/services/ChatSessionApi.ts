import { ChatSessionDto } from "../types/ChatSessionDto";
import { ChatSessionInit } from "../types/ChatSessionInit";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";


export const createChatSession = async (chatSessionInit: ChatSessionInit) => {
    return await api.post(`${apiUrl}/chat-session/init-chat`, chatSessionInit);
}
export const delChatSession = async (id: number) => {
    return await api.delete(`${apiUrl}/chat-session/${id}`);
}
export const getChatSessions = async (page = 0, size = 10) => {
    return await api.get(`${apiUrl}/chat-session?page=${page}&size=${size}`);
}
export const getChatSessionByDocId = async (docId: number) => {
    return (await api.get(`${apiUrl}/chat-session/doc/${docId}`)).data;
}
export const updateChatSession = async (id: number, chatSession: ChatSessionDto) => {
    return (await api.put(`${apiUrl}/chat-session/${id}`, chatSession)).data;
}
