

import { AssistantFile } from '../types/AssistantFile';
import api from '../utils/api';
import { apiUrl } from '../utils/ApiUtil';

export const getAssistantFilesByChatSessionId = async (chatSessionId: number) => {
    return await api.get(`${apiUrl}/assistant-file/${chatSessionId}`);
};
export const delAssistantFile = async (name: string) => {
    return await api.delete(`${apiUrl}/assistant-file/${name}`);
}
export const addAssistantFiles = async (data: AssistantFile[]) => {
    return await api.post(`${apiUrl}/assistant-file`, data);
}
export const updateAssistantFile = async (name: string, data: AssistantFile) => {
    return await api.put(`${apiUrl}/assistant-file/${name}`, data);
}