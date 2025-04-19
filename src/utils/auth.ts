export const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem("refreshToken");
};
