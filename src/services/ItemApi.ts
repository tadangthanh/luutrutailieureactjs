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