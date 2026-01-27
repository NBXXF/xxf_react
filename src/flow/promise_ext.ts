// src/lib/promise_ext.ts

import {toast} from "react-toastify";

declare global {
    interface Promise<T> {
        bindErrorNotice(filter?: (error: any) => boolean): Promise<T>;
    }
}

export function initPromiseErrorExtension(): void {
    if (typeof Promise === 'undefined') {
        console.warn('Promise is not available in this environment.');
        return;
    }

    // 防止重复定义
    if ((Promise.prototype as any).bindErrorNotice) {
        console.warn('Promise.prototype.bindErrorNotice is already defined.');
        return;
    }

    // 使用 Object.defineProperty，避免直接赋值
    Object.defineProperty(Promise.prototype, 'bindErrorNotice', {
        value: function <T>(
            this: Promise<T>,
            filter?: (error: any) => boolean
        ): Promise<T> {
            return this.catch((error: any) => {
                const shouldHandle = filter ? filter(error) : true;

                if (shouldHandle) {
                    // 错误处理逻辑
                    console.error('==========>[Promise Error Notice]', {
                        message: error?.message || 'Unknown error',
                        error: error,
                        timestamp: new Date().toISOString(),
                        stack: error?.stack
                    });

                    // 使用 toast 通知（需要确保 toast 可用）
                    try {
                        // 检查 toast 是否可用
                        const errorMessage = error?.message || 'An error occurred';
                        toast.error(errorMessage.substring(0, 100));
                    } catch (toastError) {
                        // toast 不可用时静默失败
                        console.warn('Toast notification failed:', toastError);
                    }
                }

                throw error;
            });
        },
        writable: true,
        configurable: true,
        enumerable: false // 设置为不可枚举，避免出现在 for...in 循环中
    });
}