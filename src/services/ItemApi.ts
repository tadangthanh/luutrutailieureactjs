import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const getItems = async (page = 0, size = 10, items: string[]) => {
    try {
        return (await api.get(`${apiUrl}/items?page=${page}&size=${size}&items=${items}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch folder items.");
    }
}
export const getEmailsShared = async (page = 0, size = 10, keyword: string) => {
    try {
        return (await api.get(`${apiUrl}/items/emails?page=${page}&size=${size}&keyword=${keyword}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch emails.");
    }
}