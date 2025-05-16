import api from "../utils/api";
import { apiUrl } from "../utils/ApiUtil";

export const accessSharedLink = async (token: string) => {
    return (await api.get(`${apiUrl}/shared-link/${token}`)).data;
};

