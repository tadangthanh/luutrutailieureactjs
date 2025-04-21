export class PageResponse<T> {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    hasNext: boolean;
    totalItems: number;
    items: T[];

    constructor(pageNo: number, pageSize: number, totalPage: number, hasNext: boolean, totalItems: number, items: T[]) {
        this.pageNo = pageNo;
        this.pageSize = pageSize;
        this.totalPage = totalPage;
        this.hasNext = hasNext;
        this.totalItems = totalItems;
        this.items = items;
    }
}