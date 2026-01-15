import {useEffect, useRef, useState} from "react";
import {EventSourceMessage} from "@microsoft/fetch-event-source";
import {SSEStatus} from "./SSEStatus";
import {sseRegistry} from "./SSERegistry";
import {SSEManager} from "./SSEManager";

type UseSSEParams = {
    url?: string | null | Promise<string | null>;
    headers?: Record<string, string> | Promise<Record<string, string>>;
    onMessage: (event: EventSourceMessage) => void;
    enabled?: boolean;
};

export function useSSE({
                           url,
                           headers,
                           onMessage,
                           enabled = true,
                       }: UseSSEParams) {
    const callbackRef = useRef(onMessage);
    callbackRef.current = onMessage;

    const [status, setStatus] = useState<SSEStatus>(SSEStatus.idle);

    useEffect(() => {
        if (!enabled) return;

        let canceled = false; // 用于处理 cleanup
        let manager: SSEManager | null = null;
        let unsubscribe: (() => void) | null = null;
        let stateUnsubscribe: (() => void) | null = null;

        async function setupSSE() {
            // 先解析异步 url 和 headers
            const resolvedUrl = typeof url === "function" || url instanceof Promise ? await url : url;
            if (!resolvedUrl) return;

            const resolvedHeaders = headers instanceof Promise ? await headers : headers || {};

            if (canceled) return; // 组件卸载或依赖变化时直接返回

            manager = sseRegistry.getOrCreate(resolvedUrl, () => new SSEManager(resolvedUrl, resolvedHeaders));

            unsubscribe = manager.subscribe((event) => {
                callbackRef.current(event);
            });

            stateUnsubscribe = manager.subscribeStatus((s) => setStatus(s));
        }

        setupSSE().catch(console.error);

        return () => {
            canceled = true;
            unsubscribe?.();
            stateUnsubscribe?.();
        };
    //}, [url, headers, enabled]);
    }, [url, enabled]);

    return {status};
}