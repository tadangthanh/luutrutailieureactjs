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
export const downloadDoc = async (documentId: number) => {
    try {
        const response = await api.get(`/documents/${documentId}/download`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        let fileName = "downloaded-file";
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
            // hỗ trợ filename*=UTF-8''<encoded>
            const match = contentDisposition.match(/filename\*?=([^;]+)/);
            if (match?.[1]) {
                fileName = decodeURIComponent(match[1].replace(/UTF-8''/, '').trim());
            }
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        toast.error("Failed to download document.");
    }
};
export const searchDocuments = async (keyword: string, page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/documents/search-metadata?query=${keyword}&page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to search documents.");
    }
}
export const getOnlyOfficeConfig = async (documentId: number) => {
    try {
        return (await api.get(`${apiUrl}/documents/${documentId}/onlyoffice-config`)).data;
    } catch (error) {
        toast.error("Failed to get OnlyOffice config.");
    }
}