import {CSSProperties, ElementType, ReactNode} from "react";
import {LayoutSize} from "../../../foundation/LayoutSize";

export interface SizedLayoutProps {
    /** 子元素 */
    children: ReactNode;
    /** 容器的 className */
    className?: string;
    /** 容器的 style */
    style?: CSSProperties;
    /** 自定义容器元素类型，默认 div */
    as?: ElementType;
    /** 防抖延迟（毫秒） */
    debounce?: number;
    /** 尺寸未就绪时显示的占位内容 */
    fallback?: ReactNode;
    /** 尺寸变化时的回调 */
    onResize?: (size: LayoutSize) => void;
}
