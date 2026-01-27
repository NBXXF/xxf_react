import { useState, useEffect, useCallback } from 'react';

/**
 * VideoState - 视频播放状态接口
 * 用于描述 HTML5 video 元素的完整播放状态
 */
export interface VideoState {
    /** 是否正在播放（非暂停且未结束） */
    playing: boolean;
    /** 是否正在缓冲（播放中因数据不足暂停） */
    buffering: boolean;
    /** 是否可以播放（已加载足够数据） */
    canPlay: boolean;
    /** 当前播放时间（秒） */
    currentTime: number;
    /** 视频总时长（秒） */
    duration: number;
    /** 已缓冲的时间点（秒） */
    buffered: number;
    /** 视频原始宽度（像素） */
    videoWidth: number;
    /** 视频原始高度（像素） */
    videoHeight: number;
    /** 是否已播放结束 */
    ended: boolean;
    /** 播放错误信息（无错误时为 null） */
    error: MediaError | null;
}

/**
 * useVideoState - 视频状态管理 Hook
 * @param videoRef - 外部传入的 videoRef，可跨层级（允许 null）
 * @param autoPlay - 是否在 canPlay 后自动播放
 */
export function useVideoState(videoRef: React.RefObject<HTMLVideoElement | null>, autoPlay = false) {
    const [state, setState] = useState<VideoState>({
        playing: false,
        buffering: false,
        canPlay: false,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        videoWidth: 0,
        videoHeight: 0,
        ended: false,
        error: null,
    });

    // 核心事件回调
    const updatePlaying = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({ ...s, playing: !v.paused && !v.ended }));
    }, [videoRef]);

    // 缓冲状态：waiting 时为 true，playing 时为 false
    const setBufferingTrue = useCallback(() => {
        setState(s => ({ ...s, buffering: true }));
    }, []);

    const setBufferingFalse = useCallback(() => {
        setState(s => ({ ...s, buffering: false }));
    }, []);

    const updateCanPlay = useCallback(() => {
        setState(s => ({ ...s, canPlay: true }));
        if (autoPlay) {
            const v = videoRef.current;
            v?.play().catch(() => {});
        }
    }, [videoRef, autoPlay]);

    const updateTime = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({ ...s, currentTime: v.currentTime }));
    }, [videoRef]);

    const updateDuration = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({ ...s, duration: v.duration }));
    }, [videoRef]);

    const updateBuffered = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({
            ...s,
            buffered: v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0
        }));
    }, [videoRef]);

    const updateSize = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({
            ...s,
            videoWidth: v.videoWidth,
            videoHeight: v.videoHeight
        }));
    }, [videoRef]);

    const updateEnded = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({ ...s, ended: v.ended }));
    }, [videoRef]);

    const updateError = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setState(s => ({ ...s, error: v.error }));
    }, [videoRef]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // 注册事件
        video.addEventListener('play', updatePlaying);           // 播放请求被接受
        video.addEventListener('playing', updatePlaying);        // 真正开始播放（有画面）
        video.addEventListener('playing', setBufferingFalse);    // 播放时结束缓冲
        video.addEventListener('pause', updatePlaying);          // 暂停
        video.addEventListener('waiting', updatePlaying);        // 缓冲中（暂时无法播放）
        video.addEventListener('waiting', setBufferingTrue);     // 开始缓冲
        video.addEventListener('canplay', updateCanPlay);
        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('durationchange', updateDuration);
        video.addEventListener('progress', updateBuffered);
        video.addEventListener('loadedmetadata', updateSize);
        video.addEventListener('ended', updateEnded);
        video.addEventListener('error', updateError);

        // cleanup
        return () => {
            video.removeEventListener('play', updatePlaying);
            video.removeEventListener('playing', updatePlaying);
            video.removeEventListener('playing', setBufferingFalse);
            video.removeEventListener('pause', updatePlaying);
            video.removeEventListener('waiting', updatePlaying);
            video.removeEventListener('waiting', setBufferingTrue);
            video.removeEventListener('canplay', updateCanPlay);
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('durationchange', updateDuration);
            video.removeEventListener('progress', updateBuffered);
            video.removeEventListener('loadedmetadata', updateSize);
            video.removeEventListener('ended', updateEnded);
            video.removeEventListener('error', updateError);
        };
    }, [videoRef, updatePlaying, setBufferingTrue, setBufferingFalse, updateCanPlay, updateTime, updateDuration, updateBuffered, updateSize, updateEnded, updateError]);

    // 控制方法
    const play = useCallback(() => videoRef.current?.play().catch(() => {}), [videoRef]);
    const pause = useCallback(() => videoRef.current?.pause(), [videoRef]);
    const seek = useCallback((time: number) => { if (videoRef.current) videoRef.current.currentTime = time; }, [videoRef]);

    return { playState: state, play, pause, seek };
}
