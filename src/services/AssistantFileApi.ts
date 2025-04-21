

import { AssistantFile } from '../types/AssistantFile';
import api from '../utils/api';
import { apiUrl } from '../utils/ApiUtil';

export const getAssistantFileList = async (page = 0, size = 10, sortBy?: String) => {
    return await api.get(`${apiUrl}/assistant-file?page=${page}&size=${size}&sort=id,desc`);
};
export const delAssistantFile = async (name: string) => {
    return await api.delete(`${apiUrl}/assistant-file/${name}`);
}
export const updateAssistantFile = async (name: string, data: AssistantFile) => {
    return await api.put(`${apiUrl}/assistant-file/${name}`, data);
}