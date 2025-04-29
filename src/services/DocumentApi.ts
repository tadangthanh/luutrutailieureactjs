import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const getDocumentPage = async (page = 0, size = 10, documents: string[]) => {
    try {
        return (await api.get(`${apiUrl}/documents?page${page}&size=${size}&documents=${documents}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch folder page.");
    }
}
export const uploadEmptyParent = async (formData: FormData) => {
    try {
        return (await api.post(`/documents`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })).data;
    } catch (error) {
        toast.error("Failed to upload documents.");
    }
}
export const uploadWithParent = async (folderId: number, formData: FormData) => {
    try {
        return (await api.post(`/documents/folder/${folderId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })).data;
    } catch (error) {
        toast.error("Failed to upload documents.");
    }
}
export const copyDocument = async (documentId: number) => {
    try {
        return (await api.post(`/documents/${documentId}/copy`)).data;
    } catch (error) {
        toast.error("Failed to copy document.");
    }
}
