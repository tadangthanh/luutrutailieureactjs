import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";
import { ItemRequest } from "../types/ItemRequest";

export const getItems = async (page = 0, size = 10, items: string[]) => {
    try {
        return (await api.get(`${apiUrl}/items?page=${page}&size=${size}&items=${items}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch folder items.");
    }
}
export const updateItem = async (id: number, data: ItemRequest) => {
    try {
        return (await api.put(`${apiUrl}/items/${id}`, data)).data;
    } catch (error) {
        toast.error("Có lỗi khi cập nhật item");
    }
}
export const getEmailsShared = async (page = 0, size = 10, keyword: string) => {
    try {
        return (await api.get(`${apiUrl}/items/emails?page=${page}&size=${size}&keyword=${keyword}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch emails.");
    }
}