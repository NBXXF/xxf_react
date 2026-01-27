/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}


/**
 * 检查 API 响应是否成功
 */
export function isApiSuccess(code: number): boolean {
    return code === 0 || code === 200
}

/**
 * API 错误类
 */
export class ApiError extends Error {
    code: number

    constructor(code: number, message: string) {
        super(`API Error: (${code}) ${message}`)
        this.name = 'ApiError'
        this.code = code
    }
}

/**
 * 从 API 响应中json提取data字段数据，失败时抛出错误
 * @deprecated 请使用 {@link getDataFieldOrThrow} 代替
 */
export function getDataOrThrow<T>(response: ApiResponse<T>): T {
    return getDataFieldOrThrow(response)
}


/**
 * 从 API 响应中json提取data字段数据，失败时抛出错误
 */
export function getDataFieldOrThrow<T>(response: ApiResponse<T>): T {
    if (!isApiSuccess(response.code)) {
        throw new ApiError(response.code, response.message)
    }
    return response.data
}
