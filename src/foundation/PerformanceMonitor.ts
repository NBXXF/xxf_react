export class PerformanceMonitor {
    private startTime: number = 0
    private label: string = ''

    /**
     * 开始计时
     */
    start(label?: string): PerformanceMonitor {
        this.startTime = performance.now()
        if (label) this.label = label
        if (this.label) console.time(this.label)
        return this
    }

    /**
     * 结束计时并返回时间（毫秒）
     */
    end(): number {
        const elapsed = performance.now() - this.startTime
        if (this.label) console.timeEnd(this.label)
        return elapsed
    }
}