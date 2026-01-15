import { useEffect, useRef, useState } from "react";
import { EventSourceMessage } from "@microsoft/fetch-event-source";
import { SSEStatus } from "./SSEStatus";
import { sseRegistry } from "./SSERegistry";
import { SSEManager } from "./SSEManager";

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

    // ---------- Step 1: resolve async url and headers ----------
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
    const [resolvedHeaders, setResolvedHeaders] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!enabled) return;

        let canceled = false;

        (async () => {
            try {
                const u = url instanceof Promise ? await url : url || null;
                const h = headers instanceof Promise ? await headers : headers || {};

                if (!canceled) {
                    setResolvedUrl(u);
                    setResolvedHeaders(h);
                }
            } catch (err) {
                console.error("useSSE resolve error:", err);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [url, headers, enabled]);

    // ---------- Step 2: create SSEManager ----------
    useEffect(() => {
        if (!enabled || !resolvedUrl) return;

        let canceled = false;
        let manager: SSEManager | null = null;
        let unsubscribe: (() => void) | null = null;
        let stateUnsubscribe: (() => void) | null = null;

        manager = sseRegistry.getOrCreate(resolvedUrl, () => new SSEManager(resolvedUrl, resolvedHeaders));

        unsubscribe = manager.subscribe((event) => {
            if (!canceled) callbackRef.current(event);
        });

        stateUnsubscribe = manager.subscribeStatus((s) => {
            if (!canceled) setStatus(s);
        });

        return () => {
            canceled = true;
            unsubscribe?.();
            stateUnsubscribe?.();
        };
    }, [resolvedUrl, resolvedHeaders, enabled]);

    return { status };
}
