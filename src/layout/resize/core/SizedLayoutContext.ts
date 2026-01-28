import {LayoutSize} from "../../../foundation/LayoutSize";
import {createContext, useContext} from "react";

/** Context 中的尺寸状态 */
export interface SizedLayoutContextValue extends LayoutSize {
    /** 是否已获取到有效尺寸 */
    isReady: boolean;
}

export const SizedLayoutContext = createContext<SizedLayoutContextValue | null>(null);

/**
 * 获取父级容器（SizedLayout 或 SizedContainer）的尺寸
 *
 * @throws 如果不在 SizedLayout 或 SizedContainer 内部使用会抛出错误
 *
 * @example
 * ```tsx
 * function ChildComponent() {
 *   const { width, height, isReady } = useContextLayoutSize();
 *   if (!isReady) return <Loading />;
 *   return <div style={{ width, height }}>...</div>;
 * }
 * ```
 */
export function useContextLayoutSize(): SizedLayoutContextValue {
    const context = useContext(SizedLayoutContext);
    if (!context) {
        throw new Error('useContextLayoutSize must be used within a SizedLayout or SizedContainer');
    }
    return context;
}
