import {useRef, useCallback, useEffect} from 'react';

/** 滚动对齐方式 */
type ScrollAlign = 'center' | 'start' | 'end' | 'nearest';

/** 滚动配置选项 */
interface ScrollOptions {
    /** 滚动行为：'smooth' 平滑滚动 | 'instant' 瞬间滚动 | 'auto' 自动，默认 'smooth' */
    behavior?: ScrollBehavior;
    /** 对齐方式：'center' 居中 | 'start' 起始 | 'end' 末尾 | 'nearest' 最近可见，默认 'center' */
    align?: ScrollAlign;
}

/**
 * 将元素滚动到容器指定位置
 * @param element - 要滚动到的目标元素，为 null 时不执行滚动
 * @param container - 可滚动的容器元素，为 null 时不执行滚动
 * @param options - 滚动配置选项
 * @param options.behavior - 滚动行为，默认 'smooth'
 * @param options.align - 对齐方式，默认 'center'
 */
export const scrollToElement = (
    element: HTMLElement | null,
    container: HTMLElement | null,
    options: ScrollOptions = {}
) => {
    if (!element || !container) return;

    const {behavior = 'smooth', align = 'center'} = options;

    // 使用 getBoundingClientRect 计算相对位置（更可靠，不受 DOM 层级影响）
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const elementLeftRelative = elementRect.left - containerRect.left + container.scrollLeft;

    const containerWidth = container.offsetWidth;
    const elementWidth = element.offsetWidth;
    const maxScroll = container.scrollWidth - containerWidth;

    let scrollLeft: number;

    switch (align) {
        case 'start':
            scrollLeft = elementLeftRelative;
            break;
        case 'end':
            scrollLeft = elementLeftRelative - containerWidth + elementWidth;
            break;
        case 'nearest': {
            const currentScroll = container.scrollLeft;
            const elementRight = elementLeftRelative + elementWidth;
            const visibleLeft = currentScroll;
            const visibleRight = currentScroll + containerWidth;

            if (elementLeftRelative < visibleLeft) {
                scrollLeft = elementLeftRelative;
            } else if (elementRight > visibleRight) {
                scrollLeft = elementRight - containerWidth;
            } else {
                return; // 已在视口内，不滚动
            }
            break;
        }
        case 'center':
        default:
            scrollLeft = elementLeftRelative - containerWidth / 2 + elementWidth / 2;
    }

    // 限制在有效范围内
    const clampedScroll = Math.max(0, Math.min(scrollLeft, maxScroll));

    container.scrollTo({
        left: clampedScroll,
        behavior,
    });
};

/**
 * scrollToElement 的别名，保持向后兼容
 * @deprecated 请使用 {@link scrollToElement} 代替
 */
export const scrollToCenter = scrollToElement;

/** useScrollToCenter Hook 的配置选项 */
interface UseScrollToCenterOptions {
    /** 初始值，用于首次渲染时自动滚动到该值对应的元素（通过 data-value 属性匹配） */
    initialValue?: string | number;
    /** 对齐方式：'center' 居中 | 'start' 起始 | 'end' 末尾 | 'nearest' 最近可见，默认 'center' */
    align?: ScrollAlign;
    /** 滚动行为：'smooth' 平滑滚动 | 'instant' 瞬间滚动 | 'auto' 自动，默认 'smooth' */
    behavior?: ScrollBehavior;
}

/**
 * Hook: 用于可滚动 Tabs 的自动居中
 * https://www.radix-ui.com/primitives/docs/components/tabs
 *
 * @param options - 配置选项
 * @param options.initialValue - 初始值，首次渲染时自动滚动到该值对应的元素
 * @param options.align - 对齐方式，默认 'center'
 * @param options.behavior - 滚动行为，默认 'smooth'
 *
 * @returns 返回对象包含：
 * - `containerRef` - 绑定到可滚动容器的 ref
 * - `scrollToValue` - 滚动到指定 data-value 值的元素
 * - `scrollTo` - 滚动到指定 HTMLElement 元素
 *
 * @example
 * ```tsx
 * const { containerRef, scrollToValue } = useScrollToCenter({
 *   initialValue: activeTab,  // 首次渲染时滚动到初始值
 * });
 *
 * <Tabs.List ref={containerRef}>
 *   <Tabs.Trigger data-value="tab1">Tab 1</Tabs.Trigger>
 * </Tabs.List>
 *
 * 如果<Tabs.List 里面又嵌套了可以滚动的div,那么ref必须绑定在可以滚动的div上
 *
 * // 切换时调用
 * scrollToValue('tab1');
 * ```
 */
export const useScrollToCenter = <T extends string | number = string>(
    options: UseScrollToCenterOptions = {}
) => {
    const {initialValue, align = 'center', behavior = 'smooth'} = options;
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // 初始渲染时滚动到初始值（无动画）
    useEffect(() => {
        if (initializedRef.current || initialValue === undefined) return;
        initializedRef.current = true;

        // 延迟执行，确保 DOM 渲染完成
        requestAnimationFrame(() => {
            const container = containerRef.current;
            const element = container?.querySelector(
                `[data-value="${initialValue}"]`
            ) as HTMLElement | null;
            scrollToElement(element, container, {behavior: 'instant', align});
        });
    }, [initialValue, align]);

    /**
     * 滚动到指定 data-value 值的元素
     * @param value - 目标元素的 data-value 属性值
     * @param scrollOptions - 可选的滚动配置，覆盖默认配置
     */
    const scrollToValue = useCallback(
        (value: T, scrollOptions?: ScrollOptions) => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                const element = container?.querySelector(
                    `[data-value="${value}"]`
                ) as HTMLElement | null;
                scrollToElement(element, container, {
                    behavior,
                    align,
                    ...scrollOptions,
                });
            });
        },
        [align, behavior]
    );

    /**
     * 滚动到指定的 HTMLElement 元素
     * @param element - 目标 HTMLElement 元素
     * @param scrollOptions - 可选的滚动配置，覆盖默认配置
     */
    const scrollTo = useCallback(
        (element: HTMLElement | null, scrollOptions?: ScrollOptions) => {
            requestAnimationFrame(() => {
                scrollToElement(element, containerRef.current, {
                    behavior,
                    align,
                    ...scrollOptions,
                });
            });
        },
        [align, behavior]
    );

    return {
        /** 绑定到可滚动容器的 ref */
        containerRef,
        /** 滚动到指定 data-value 值的元素 */
        scrollToValue,
        /** 滚动到指定 HTMLElement 元素 */
        scrollTo,
    };
};
