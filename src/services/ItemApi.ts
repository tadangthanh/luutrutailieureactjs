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
export const getItemsSharedWithMe = async (page = 0, size = 10, items: string[]) => {
    try {
        return (await api.get(`${apiUrl}/items/shared-with-me?page=${page}&size=${size}&items=${items}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch shared with me items.");
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
export const delItem = async (id: number) => {
    try {
        return (await api.delete(`${apiUrl}/items/${id}`)).data;
    } catch (error) {
        toast.error("Có lỗi khi xóa item");
    }
}
export const getTrash = async (page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/items/trash?page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to fetch trash items.");
    }
}

export const cleanTrash = async () => {
    try {
        return (await api.delete(`${apiUrl}/items/clean-trash`)).data;
    } catch (error) {
        toast.error("Có lỗi khi dọn rác");
    }
}
export const restoreItem = async (id: number) => {
    try {
        return (await api.post(`${apiUrl}/items/restore/${id}`)).data;
    } catch (error) {
        toast.error("Có lỗi khi khôi phục item");
    }
}
export const deleteForeverItem = async (id: number) => {
    try {
        return (await api.delete(`${apiUrl}/items/delete-forever/${id}`)).data;
    } catch (error) {
        toast.error("Có lỗi khi xóa item vĩnh viễn");
    }
}