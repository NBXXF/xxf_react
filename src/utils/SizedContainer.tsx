'use client'

import { useResizeDetector } from 'react-resize-detector';
import { ReactNode, CSSProperties, ElementType, ComponentPropsWithoutRef } from 'react';
import React from "react";

export interface ContainerSize {
    width: number;
    height: number;
}

interface SizedContainerProps<T extends ElementType = 'div'> {
    /** 子元素渲染函数，接收容器尺寸和就绪状态 */
    children: (size: ContainerSize & { isReady: boolean }) => ReactNode;
    /** 容器的 className */
    className?: string;
    /** 容器的 style */
    style?: CSSProperties;
    /** 自定义容器元素类型，默认 div */
    as?: T;
    /** 是否只监听宽度变化 */
    widthOnly?: boolean;
    /** 是否只监听高度变化 */
    heightOnly?: boolean;
    /** 防抖延迟（毫秒） */
    debounce?: number;
    /** 是否跳过首次挂载时的计算 */
    skipOnMount?: boolean;
    /** 尺寸未就绪时显示的占位内容 */
    fallback?: ReactNode;
    /** 尺寸变化时的回调 */
    onResize?: (size: ContainerSize) => void;
}

/**
 * 自动测量尺寸的容器组件
 *
 * @example
 * // 基础用法
 * <SizedContainer className="h-full w-full">
 *   {({ width, height, isReady }) => (
 *     <VirtuosoGrid style={{ width, height }} ... />
 *   )}
 * </SizedContainer>
 *
 * @example
 * // 只监听高度，带防抖和占位符
 * <SizedContainer
 *   heightOnly
 *   debounce={100}
 *   fallback={<Skeleton />}
 * >
 *   {({ height }) => <List style={{ height }} />}
 * </SizedContainer>
 *
 * @example
 * // 自定义元素类型
 * <SizedContainer as="section" className="h-full">
 *   {({ width, height }) => <Chart width={width} height={height} />}
 * </SizedContainer>
 */
export function SizedContainer<T extends ElementType = 'div'>({
                                                                  children,
                                                                  className,
                                                                  style,
                                                                  as,
                                                                  widthOnly = false,
                                                                  heightOnly = false,
                                                                  debounce,
                                                                  skipOnMount = false,
                                                                  fallback,
                                                                  onResize,
                                                              }: SizedContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof SizedContainerProps<T>>) {
    const { width, height, ref } = useResizeDetector<HTMLElement>({
        handleWidth: !heightOnly,
        handleHeight: !widthOnly,
        refreshMode: debounce ? 'debounce' : undefined,
        refreshRate: debounce,
        skipOnMount,
        onResize: onResize
            ? ({ width: w, height: h }) => {
                if (w !== null && h !== null) {
                    onResize({ width: w, height: h });
                }
            }
            : undefined,
    });

    const size: ContainerSize = {
        width: width ?? 0,
        height: height ?? 0,
    };

    // 根据监听模式判断是否就绪
    const isReady = (() => {
        if (widthOnly) return size.width > 0;
        if (heightOnly) return size.height > 0;
        return size.width > 0 && size.height > 0;
    })();

    const Component = as || 'div';

    return (
        <Component ref={ref} className={className} style={style}>
        {isReady ? children({ ...size, isReady }) : fallback}
        </Component>
);
}
