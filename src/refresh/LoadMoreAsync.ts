import {useCallback, useEffect, useRef} from "react";
import {ApiPageDataFieldDTO} from "../models/ApiPageDataFieldDTO";
import {hasNextPage} from "../models/PaginationDTO";
/**
 * 返回一个稳定的回调（empty deps）。
 * 适合不想因 asyncResult 变化频繁重建回调的场景。
 *
 * 用法：
 * const handleLoadMore = useStableHandleLoadMore(asyncResult, setPageNum);
 * // 自定义是否有下一页的判定逻辑
 * // const handleLoadMore = useHandleLoadMoreCustom<TemplatePaginationResponse, UseAsyncReturn<TemplatePaginationResponse>>(asyncResult, setPageNum, (data) => hasNextPage(data?.pagination))
 *
 * 在对应的组件上使用
 *     endReached={handleLoadMore}
 *     atBottomStateChange={(atBottom) => {
 *       if (atBottom) {
 *          handleLoadMore()
 *       }
 *    }}
 */
export function useHandleLoadMore<TData extends ApiPageDataFieldDTO<any>, TAsyncResult extends {
    loading: boolean;
    error: unknown;
    execute: () => Promise<TData>;
    result?: TData
}>(
    asyncResult: TAsyncResult,
    setPageNum: (updater: (p: number) => number) => void,
) {
    return useHandleLoadMoreCustom<ApiPageDataFieldDTO<any>, TAsyncResult>(
        asyncResult,
        setPageNum,
        (data) => hasNextPage(data?.pagination)
    );
}


/**
 * 可自定义 hasNextPage 判定的版本（名称：useHandleLoadMoreCustom）
 * - hasNextPageFn 接受完整的 TData（可能为 undefined），返回 boolean
 * - 返回稳定回调，内部通过 ref 读取最新 asyncResult 与 hasNextPageFn
 */
export function useHandleLoadMoreCustom<TData, TAsyncResult extends {
    loading: boolean;
    error: unknown;
    execute?: () => Promise<TData>;
    result?: TData;
}>(
    asyncResult: TAsyncResult,
    setPageNum: (updater: (p: number) => number) => void,
    hasNextPage: (data: TData | undefined) => boolean,
): () => void {

    const ref = useRef<TAsyncResult>(asyncResult);
    useEffect(() => {
        ref.current = asyncResult;
    }, [asyncResult]);


    // 保证读取到最新的判断函数，同时回调保持稳定（不随函数重建）
    const hasNextRef = useRef<(data: TData | undefined) => boolean>(
        (d) => hasNextPage((d as any)?.pagination)
    );
    useEffect(() => {
        hasNextRef.current = hasNextPage;
    }, [hasNextPage]);

    return useCallback(() => {
        const cur = ref.current;
        if (!cur) return;
        if (cur.loading) return;
        if (cur.error) {
            cur.execute?.();
            return;
        }

        // 使用最新的 hasNext 判定
        if (!hasNextRef.current(cur.result)) return;

        ///进行下一页
        setPageNum(p => p + 1);
    }, [setPageNum]);
}