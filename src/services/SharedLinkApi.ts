import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";
import { CreateSharedLinkRequest } from "../types/CreateSharedLinkRequest";
import { UpdateSharedLinkRequest } from "../types/UpdateSharedLinkRequest";
export const accessSharedLink = async (token: string) => {
    try {
        return (await api.get(`${apiUrl}/shared-link/${token}`)).data;
    } catch (error) {
        toast.error("Failed to access shared link");
    }
};
export const createSharedLink = async (createSharedLinkRequest: CreateSharedLinkRequest) => {
    try {
        return (await api.post(`${apiUrl}/shared-link`, createSharedLinkRequest)).data;
    } catch (error) {
        toast.error("Failed to create shared link");
    }
};
export const disableSharedLink = async (id: number) => {
    try {
        return (await api.put(`${apiUrl}/shared-link/${id}/disable`)).data;
    } catch (error) {
        toast.error("Failed to disable shared link");
    }
};
export const enableSharedLink = async (id: number) => {
    try {
        return (await api.put(`${apiUrl}/shared-link/${id}/enable`)).data;
    } catch (error) {
        toast.error("Failed to enable shared link");
    }
};
export const deleteSharedLink = async (id: number) => {
    try {
        return (await api.delete(`${apiUrl}/shared-link/${id}`)).data;
    } catch (error) {
        toast.error("Failed to delete shared link");
    }
};
export const getSharedLink = async (id: number) => {
    try {
        return (await api.get(`${apiUrl}/shared-link/${id}`)).data;
    } catch (error) {
        toast.error("Failed to get shared link");
    }
};
export const updateSharedLink = async (id: number, updateSharedLinkRequest: UpdateSharedLinkRequest) => {
    try {
        return (await api.put(`${apiUrl}/shared-link/${id}`, updateSharedLinkRequest)).data;
    } catch (error) {
        toast.error("Failed to update shared link");
    }
};
export const getAllSharedLink = async (itemId: number, page: number, size: number) => {
    try {
        return (await api.get(`${apiUrl}/shared-link/items/${itemId}?page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to get all shared links");
    }
};

