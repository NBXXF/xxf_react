import {PaginationDTO} from "./PaginationDTO";

/**
 * 分页数据字段接口
 */
export interface ApiPageDataFieldDTO<T> {
    list: T[]
    pagination: PaginationDTO
}
