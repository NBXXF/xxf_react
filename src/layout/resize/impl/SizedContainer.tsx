'use client'

import {useResizeDetector} from 'react-resize-detector';
import React from "react";
import {LayoutSize} from "../../../foundation/LayoutSize";
import {SizedLayoutContext} from "../core/SizedLayoutContext";
import {SizedLayoutProps} from "../core/SizedLayoutProps";




/**
 * 自动测量尺寸的容器组件（基于 react-resize-detector）
 *
 * 子组件通过 useContextLayoutSize() 获取容器尺寸，适用于需要根据父容器尺寸
 * 进行布局的场景（如虚拟列表、图表、Canvas 等）。
 *
 * @example
 * ```tsx
 * // 基础用法
 * <SizedContainer className="h-full w-full">
 *   <ChartComponent />
 * </SizedContainer>
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
 * <SizedContainer fallback={<Loading />} className="h-full">
 *   <VirtualList />
 * </SizedContainer>
 * ```
 *
 * @example
 * ```tsx
 * // 自定义元素类型 + 尺寸变化回调
 * <SizedContainer
 *   as="section"
 *   debounce={100}
 *   onResize={({ width, height }) => console.log(width, height)}
 * >
 *   <Content />
 * </SizedContainer>
 * ```
 */
export function SizedContainer({
                                   children,
                                   className,
                                   style,
                                   as: Component = 'div',
                                   debounce,
                                   fallback,
                                   onResize,
                               }: SizedLayoutProps) {
    const {width, height, ref} = useResizeDetector<HTMLElement>({
        refreshMode: debounce ? 'debounce' : undefined,
        refreshRate: debounce,
        onResize: onResize
            ? ({width: w, height: h}) => {
                if (w !== null && h !== null) {
                    onResize({width: w, height: h});
                }
            }
            : undefined,
    });

    const size: LayoutSize = {
        width: width ?? 0,
        height: height ?? 0,
    };

    const isReady = size.width > 0 && size.height > 0;

    return (
        <Component ref={ref as any} className={className} style={style}>
            <SizedLayoutContext.Provider value={{...size, isReady}}>
                {fallback && !isReady ? fallback : children}
            </SizedLayoutContext.Provider>
        </Component>
    );
}
