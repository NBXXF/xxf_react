import {useState, useEffect, useRef, RefObject} from 'react';
import {LayoutSize} from "../../../foundation/LayoutSize";


interface UseResizeObserverOptions {
    /** 防抖延迟，默认 0（不防抖） */
    debounce?: number;
    /** 初始尺寸 */
    initialSize?: LayoutSize;
}

interface UseResizeObserverReturn<T extends HTMLElement> {
    /** 绑定到容器元素的 ref */
    containerRef: RefObject<T | null>;
    /** 容器宽度 */
    containerWidth: number;
    /** 容器高度 */
    containerHeight: number;
    /** 是否已获取到尺寸 */
    isContainerReady: boolean;
}

/**
 * 基于 ResizeObserver 监听容器尺寸变化
 *
 * @example
 * ```tsx
 * const { containerRef, containerWidth, containerHeight, isContainerReady } = useResizeObserver();
 *
 * return (
 *   <div ref={containerRef}>
 *     {isContainerReady && <Chart width={containerWidth} height={containerHeight} />}
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // 带防抖
 * const { containerRef, containerHeight } = useResizeObserver({ debounce: 100 });
 * ```
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
    options: UseResizeObserverOptions = {}
): UseResizeObserverReturn<T> {
    const {debounce = 0, initialSize = {width: 0, height: 0}} = options;

    const containerRef = useRef<T>(null);
    const [size, setSize] = useState<LayoutSize>(initialSize);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const updateSize = (entries: ResizeObserverEntry[]) => {
            const {width, height} = entries[0]?.contentRect ?? {width: 0, height: 0};

            if (debounce > 0) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setSize({width, height}), debounce);
            } else {
                setSize({width, height});
            }
        };

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);

        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [debounce]);

    return {
        containerRef,
        containerWidth: size.width,
        containerHeight: size.height,
        isContainerReady: size.width > 0 && size.height > 0,
    };
}
