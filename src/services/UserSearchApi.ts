import { toast } from "sonner";
import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const searchUser = async (query: string, page = 0, size = 10) => {
    try {
        return (await api.get(`${apiUrl}/user/search?query=${query}&page=${page}&size=${size}`)).data;
    } catch (error) {
        toast.error("Failed to fetch users.");
    }
}
export const getUserProfile = async () => {
    try {
        return (await api.get(`${apiUrl}/user/info`)).data;
    } catch (error) {
        toast.error("Failed to fetch users.");
    }
}
