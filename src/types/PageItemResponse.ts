import { BreadcrumbDto } from "./BreadcrumbDto";

export interface PageItemResponse<T> {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    hasNext: boolean;
    totalItems: number;
    items: T[];
    breadcrumbs: BreadcrumbDto[];

}