
export interface PaginationDTO {
    limit:       number;
    page:        number;
    total:       number;
    total_pages: number;
}
// 判断是否有下一页的方法
export const hasNextPage = (pagination?: PaginationDTO): boolean => {
    if (!pagination) return false;
    return pagination.page < pagination.total_pages;
};