

import api from '../utils/api';
import { apiUrl } from '../utils/ApiUtil';

export const getAssistantFileList = async (page = 0, size = 10, sortBy?: String) => {
    return await api.get(`${apiUrl}/assistant-file?page=${page}&size=${size}&sort=id,desc`);
};