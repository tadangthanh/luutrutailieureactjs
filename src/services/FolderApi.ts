import { toast } from "sonner";
import { FolderRequest } from "../types/FolderRequest";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const getFolderPage = async (page = 0, size = 10, folders: string[]) => {
    try {
        return (await api.get(`${apiUrl}/folders?page${page}&size=${size}&folders=${folders}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch folder page.");
    }
}
export const createFolder = async (folderRequest: FolderRequest) => {
    return (await api.post(`${apiUrl}/folders`, folderRequest)).data;
}