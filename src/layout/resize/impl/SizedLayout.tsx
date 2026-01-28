'use client'

import {useEffect, useRef} from 'react';
import {useResizeObserver} from '../core/ResizeObserverHook';
import React from "react";
import {LayoutSize} from "../../../foundation/LayoutSize";
import {SizedLayoutContext} from "../core/SizedLayoutContext";
import {SizedLayoutProps} from "../core/SizedLayoutProps";


/**
 * 自动测量尺寸的布局容器
 *
 * 子组件通过 useContextLayoutSize() 获取容器尺寸，适用于需要根据父容器尺寸
 * 进行布局的场景（如虚拟列表、图表、Canvas 等）。
 *
 * @example
 * ```tsx
 * // 基础用法
 * <SizedLayout className="h-full w-full">
 *   <ChartComponent />
 * </SizedLayout>
 *
 * // ChartComponent 内部
 * function ChartComponent() {
 *   const { width, height, isReady } = useContextLayoutSize();
 *   if (!isReady) return <Skeleton />;
 *   return <Chart width={width} height={height} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 带 fallback 的用法
 * <SizedLayout fallback={<Loading />} className="h-full">
 *   <VirtualList />
 * </SizedLayout>
 * ```
 *
 * @example
 * ```tsx
 * // 自定义元素类型 + 尺寸变化回调
 * <SizedLayout
 *   as="section"
 *   debounce={100}
 *   onResize={({ width, height }) => console.log(width, height)}
 * >
 *   <Content />
 * </SizedLayout>
 * ```
 */
export function SizedLayout({
                                children,
                                className,
                                style,
                                as: Component = 'div',
                                debounce,
                                fallback,
                                onResize,
                            }: SizedLayoutProps) {
    const {containerRef, containerWidth, containerHeight, isContainerReady} = useResizeObserver<HTMLElement>({
        debounce,
    });

    const size: LayoutSize = {
        width: containerWidth,
        height: containerHeight,
    };

    // 处理 onResize 回调
    const onResizeRef = useRef(onResize);
    onResizeRef.current = onResize;

    useEffect(() => {
        if (isContainerReady && onResizeRef.current) {
            onResizeRef.current(size);
        }
    }, [containerWidth, containerHeight, isContainerReady]);

    return (
        <Component ref={containerRef as any} className={className} style={style}>
            <SizedLayoutContext.Provider value={{...size, isReady: isContainerReady}}>
                {fallback && !isContainerReady ? fallback : children}
            </SizedLayoutContext.Provider>
        </Component>
    );
}
