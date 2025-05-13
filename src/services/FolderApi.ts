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
export const uploadFolderNullParent = async (formData: FormData) => {
    return (await api.post(`${apiUrl}/folders/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })).data;
}

export const uploadFolderWithParent = async (folderId: number, formData: FormData) => {
    return (await api.post(`${apiUrl}/folders/upload/with-parent/${folderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })).data;
}


export const downloadFolder = async (folderId: number) => {
    try {
        const response = await api.get(`/folders/${folderId}/download`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        // Mặc định tên file
        let fileName = "downloaded-folder.zip";

        // Tìm header Content-Disposition và lấy tên file
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
            // Ưu tiên filename* (UTF-8 encoded), sau đó fallback về filename
            const utf8FilenameMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/);
            const asciiFilenameMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"/);

            if (utf8FilenameMatch?.[1]) {
                fileName = decodeURIComponent(utf8FilenameMatch[1].trim());
            } else if (asciiFilenameMatch?.[1]) {
                fileName = asciiFilenameMatch[1].trim();
            }
        }

        // Tạo link tải
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        toast.error("Failed to download folder.");
    }
};
