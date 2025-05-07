import { BaseDto } from "./BaseDto";

export interface User extends BaseDto {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    totalDocuments: number;
}