/**
 * 带超时时间的请求,默认没有超时时间限制
 * @param input
 * @param init
 */
export async function fetchWithTimeout(
    input: string | URL | Request,
    init: (RequestInit & { timeout?: number }) = {},
): Promise<Response> {
    const {timeout, signal, ...rest} = init;

    if (timeout == null) {
        return fetch(input, init);
    }

    const controller = new AbortController();
    let timeoutFired = false;

    const onAbort = () => controller.abort();

    if (signal) {
        if (signal.aborted) {
            controller.abort();
        } else {
            signal.addEventListener('abort', onAbort, {once: true});
        }
    }

    const timer = setTimeout(() => {
        timeoutFired = true;
        controller.abort();
    }, timeout);

    try {
        return await fetch(input, {
            ...rest,
            signal: controller.signal,
        });
    } catch (e: any) {
        if (e.name === 'AbortError' && timeoutFired) {
            const url =
                typeof input === 'string'
                    ? input
                    : input instanceof Request
                        ? input.url
                        : input.toString();

            console.error(
                `[http timeout] ${url} (${timeout}ms)`
            );
        }
        throw e;
    } finally {
        clearTimeout(timer);
        if (signal) {
            signal.removeEventListener('abort', onAbort);
        }
    }
}
