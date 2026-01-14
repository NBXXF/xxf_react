import {useEffect, useRef, useState} from 'react';
import {EventSourceMessage} from '@microsoft/fetch-event-source';
import {SSEStatus} from "./SSEStatus";
import {sseRegistry} from "./SSERegistry";
import {SSEManager} from "./SSEManager";

type UseSSEParams = {
    url: string | null;
    onMessage: (event: EventSourceMessage) => void;
    enabled?: boolean;
};

/**
 * 内部会复用链接,无需关心实现,即使多次调用也没有关系
 * @param url
 * @param onMessage
 * @param enabled /// 可以控制,比如未登录的情况下不要订阅
 * @return {status} 状态
 */
export function useSSE({
                           url,
                           onMessage,
                           enabled = true,
                       }: UseSSEParams) {
    // 保证回调不因 render 变化导致重复订阅
    const callbackRef = useRef(onMessage);
    callbackRef.current = onMessage;
    const [status, setStatus] = useState<SSEStatus>(SSEStatus.idle);
    useEffect(() => {
        if (!url || !enabled) return;

        const manager = sseRegistry.getOrCreate(url, () => {
            return new SSEManager(url)
        });

        const unsubscribe = manager.subscribe((event) => {
            callbackRef.current(event);
        });
        const stateUnsubscribe = manager.subscribeStatus((status) => {
            setStatus(status)
        });

        return () => {
            stateUnsubscribe();
            unsubscribe();
        };
    }, [url, enabled]);

    return {status};
}
