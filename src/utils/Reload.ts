import { useState, useCallback, useRef } from 'react';

/**
 * useReloadKey 配置选项
 */
interface UseReloadKeyOptions {
    /** 初始值，默认 0 */
    initialValue?: number;
    /** reload 后的回调，参数为当前累计刷新次数 */
    onReload?: (reloadCount: number) => void;
}

/**
 * useReloadKey 返回值
 */
interface UseReloadKeyReturn {
    /** 当前 reloadKey 值，用于组件 key 属性 */
    reloadKey: number;
    /** 触发刷新，reloadKey 自增 1 */
    reload: () => void;
    /** 重置为初始值，同时清零刷新次数 */
    reset: () => void;
    /** 累计刷新次数（不受 reset 影响前的总次数） */
    reloadCount: number;
}

/**
 * 用于强制刷新组件的 Hook
 *
 * 通过改变 key 值来触发 React 组件的卸载和重新挂载，
 * 常用于需要完全重置组件状态的场景。
 *
 * @param options - 配置选项
 * @returns 包含 reloadKey、reload、reset、reloadCount 的对象
 *
 * @example
 * ```tsx
 * // 基础用法
 * const { reloadKey, reload } = useReloadKey();
 *
 * return (
 *   <div>
 *     <ChildComponent key={reloadKey} />
 *     <button onClick={reload}>刷新组件</button>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // 带回调的用法
 * const { reloadKey, reload, reloadCount } = useReloadKey({
 *   onReload: (count) => console.log(`第 ${count} 次刷新`)
 * });
 *
 * return (
 *   <div>
 *     <DataFetcher key={reloadKey} />
 *     <button onClick={reload}>重新加载数据 (已刷新 {reloadCount} 次)</button>
 *   </div>
 * );
 * ```
 */
export function useReloadKey(options: UseReloadKeyOptions = {}): UseReloadKeyReturn {
    const { initialValue = 0, onReload } = options;

    const [reloadKey, setReloadKey] = useState(initialValue);
    const [reloadCount, setReloadCount] = useState(0);

    // 用 ref 存储回调，避免 useCallback 频繁重建
    const onReloadRef = useRef(onReload);
    onReloadRef.current = onReload;

    const reload = useCallback(() => {
        setReloadKey(prev => prev + 1);
        setReloadCount(prev => {
            const newCount = prev + 1;
            // 回调放在 setState 外部更规范，但这里为了获取最新值
            onReloadRef.current?.(newCount);
            return newCount;
        });
    }, []);

    const reset = useCallback(() => {
        setReloadKey(initialValue);
        setReloadCount(0);
    }, [initialValue]);

    return {
        reloadKey,
        reload,
        reset,
        reloadCount,
    };
}
