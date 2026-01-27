import {PerformanceMonitor} from "./PerformanceMonitor";


/**
 * 类似 Kotlin 的 measureTimeMillis
 * @param block 要测量的代码块
 * @returns 执行时间（毫秒）
 */
export function measureTimeMillis(block: () => void): number {
    const monitor = new PerformanceMonitor()
    monitor.start()
    block()
    return monitor.end()
}
