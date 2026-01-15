/// 超时错误封装
export class TimeoutError extends Error {
    constructor(public timeout: number, public url: string) {
        // 提取最后两级路径
        const path = TimeoutError.extractLastTwoSegments(url);
        super(`Request timed out ${timeout}ms: ${path}`);
        this.name = 'TimeoutError';
    }


    private static extractLastTwoSegments(url: string) {
        try {
            const u = new URL(url, window.location.origin); // 支持相对路径
            const segments = u.pathname.split('/').filter(Boolean); // 去掉空段
            const lastTwo = segments.slice(-2); // 取最后两段
            return '/' + lastTwo.join('/');
        } catch {
            // 如果不是合法 URL，直接返回原始字符串
            return url;
        }
    }
}