import {initPromiseErrorExtension} from "./flow/promise_ext";

export * from './sse';
export * from './fetch';
export * from './utils';
export * from './refresh';
export * from './models';
export * from './media';
export * from './flow';
export * from './responsive';

///框架初始化函数，调用后会初始化一些全局功能
export function initXXF() {
    initPromiseErrorExtension()
}