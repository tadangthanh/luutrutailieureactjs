import { ResourceResponse } from "./ResourceResponse";

export interface DocumentResponse extends ResourceResponse {
    type: string;
    blobName: string;
    version: number;
}