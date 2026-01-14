import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {SSEStatus} from "./SSEStatus";

type Listener = (event: EventSourceMessage) => void;
type StatusListener = (status: SSEStatus) => void;

export class SSEManager {
    private controller: AbortController | null = null;
    private listeners = new Set<Listener>();
    private statusListeners = new Set<StatusListener>();
    private connecting = false;
    private status: SSEStatus = SSEStatus.idle;

    constructor(
        private url: string,
        private headers: Record<string, string> = {}
    ) {
    }

    private setStatus(next: SSEStatus, distinct: boolean) {
        if (distinct) {
            if (this.status != next) {
                this.status = next;
                this.statusListeners.forEach(fn => fn(next));
            }
        } else {
            this.status = next;
            this.statusListeners.forEach(fn => fn(next));
        }
    }

    connect() {
        if (this.connecting) return;
        this.connecting = true;
        this.setStatus(SSEStatus.connecting, true);

        this.controller = new AbortController();

        fetchEventSource(this.url, {
            signal: this.controller.signal,
            headers: {
                Accept: 'text/event-stream',
                ...this.headers,
            },

            onopen: (response) => {
                this.connecting = false;
                console.log('[SSE] connected:', this.url);
                this.setStatus(SSEStatus.connected, true);
                return Promise.resolve();
            },

            onmessage: (event) => {
                this.listeners.forEach(fn => fn(event));
            },

            onerror: (err) => {
                console.error('[SSE] error:', err);
                this.setStatus(SSEStatus.error, true);
                return 3000; // 3 秒后重连
            },

            onclose: () => {
                console.log('[SSE] closed:', this.url);
                this.connecting = false;
            },
        }).catch(console.error);
    }

    disconnect() {
        this.controller?.abort();
        this.controller = null;
        this.connecting = false;
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        this.connect()
        return () => this.listeners.delete(listener);
    }


    subscribeStatus(listener: StatusListener) {
        this.statusListeners.add(listener);
        this.setStatus(this.status, false); // 立即同步一次
        return () => this.statusListeners.delete(listener);
    }
}
