import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const saveItem = async (itemId: number) => {
    try {
        return (await api.post(`${apiUrl}/saved-items/add/${itemId}`,)).data;
    } catch (error) {
        toast.error("Failed to save item");
    }
}
export const removeItem = async (itemId: number) => {
    try {
        return (await api.delete(`${apiUrl}/saved-items/remove/${itemId}`,)).data;
    } catch (error) {
        toast.error("Failed to remove item");
    }
}
export const getSavedItems = async (page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/saved-items?page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to fetch saved items");
    }
}