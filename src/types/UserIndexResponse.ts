export interface UserIndexResponse {
    user: {
        id: string;
        fullName: string;
        email: string;
        avatarUrl: string | null;
    },
    highlights: {
        "email": string[];
        "fullName": string[];
    }
}