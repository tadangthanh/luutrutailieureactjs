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
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 0));
                console.log(`Uploading: ${progress}%`);
            }
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
        const response = await api.get(`/documents/${documentId}/download/${localStorage.getItem("accessToken")}`, {
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
export const fetchDocAsFilePdf = async (documentId: number): Promise<File | null> => {
    try {
        const response = await api.get(`/documents/${documentId}/download-as-pdf`, {
            responseType: "blob",
        });

        // Sử dụng type từ response nếu có
        const mimeType = response.headers["content-type"] || "application/octet-stream";

        // Tạo Blob với type đúng
        const blob = new Blob([response.data], { type: mimeType });


        // Lấy tên file từ content-disposition
        let fileName = "downloaded-file";
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=([^;]+)/);
            if (match?.[1]) {
                fileName = decodeURIComponent(match[1].replace(/UTF-8''/, '').trim());
            }
        }

        return new File([blob], fileName, { type: blob.type });
    } catch (error) {
        toast.error("Tải tài liệu thất bại.");
        return null;
    }
};

export const searchDocuments = async (keyword: string, page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/documents/search-metadata?query=${keyword}&page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to search documents.");
    }
}
export const getVersionHistory = async (documentId: number) => {
    try {
        return (await api.get(`${apiUrl}/document-versions/${documentId}/versions`)).data;
    } catch (error) {
        toast.error("Failed to fetch version history.");
    }
}
export const getOnlyOfficeConfigForVersion = async (versionId: number) => {
    try {
        return (await api.get(`${apiUrl}/document-versions/${versionId}/config-preview`)).data;
    } catch (error) {
        toast.error("Failed to fetch version history.");
    }
}
export const restoreVersion = async (documentId: number, targetVersionId: number) => {
    try {
        return (await api.post(`${apiUrl}/document-versions/${documentId}/versions/${targetVersionId}/restore`)).data;
    } catch (error) {
        toast.error("Failed to fetch version history.");
    }
}
export const downloadVersion = async (versionId: number) => {
    try {
        const response = await api.get(`/document-versions/${versionId}/download`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'downloaded_file';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=([^;]+)/);
            if (match?.[1]) {
                fileName = decodeURIComponent(match[1].replace(/UTF-8''/, '').trim());
            }
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        toast.error("Tải xuống phiên bản thất bại");
    }
};

export const getOnlyOfficeConfig = async (documentId: number) => {
    try {
        return (await api.get(`${apiUrl}/documents/${documentId}/onlyoffice-config`)).data;
    } catch (error) {
        toast.error("Failed to get OnlyOffice config.");
    }
}