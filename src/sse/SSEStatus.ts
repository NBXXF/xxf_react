export enum SSEStatus {
    idle = 'idle',
    connecting = 'connecting',  // 建立中
    connected = 'connected',        // 已连接
    error = 'error'    // 错误中（会重连）
}