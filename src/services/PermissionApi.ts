import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";
import { PermissionRequest } from "../types/PermissionRequest";

export const getPagePermissionByItemId = async (itemId: number, page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/permissions/item/${itemId}?page=${page}&size=${size}`,)).data;
    } catch (error) {
        toast.error("Failed to fetch permission items.");
    }
}
export const hasPermissionEditor = async (id: number) => {
    try {
        return (await api.get(`${apiUrl}/permissions/has-permission/${id}`)).data;
    } catch (error) {
        toast.error("Failed to check permission.");
    }
}
export const addPermission = async (itemId: number, permissionRequest: PermissionRequest) => {
    try {
        return (await api.post(`${apiUrl}/permissions/item/${itemId}`, permissionRequest)).data;
    } catch (error) {
        toast.error("Failed to add permission.");
    }
};
export const saveOrUpdateBatch = async (itemId: number, permissionsRequest: PermissionRequest[]) => {
    try {
        return (await api.post(`${apiUrl}/permissions/item/${itemId}/batch`, permissionsRequest)).data;
    } catch (error) {
        toast.error("Failed to add permission.");
    }
};