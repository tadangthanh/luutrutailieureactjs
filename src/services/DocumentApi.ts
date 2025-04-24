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