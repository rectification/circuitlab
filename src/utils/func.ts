import { isFunc } from './assert';

/** 延迟函数 */
export function delay(time = 0) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * 轮询等待输入函数返回`true`
 * @param {() => boolean} fn
 * @param {number} [interval=200]
 * @param {number} [stopTimeout=60000]
 * @returns {Promise<void>}
 */
export function wait(fn: () => boolean, interval = 200, stopTimeout = 60000) {
    let timeout = false;

    const timer = setTimeout(() => (timeout = true), stopTimeout);

    return (function check(): Promise<void> {
        if (fn()) {
            clearTimeout(timer);
            return Promise.resolve();
        }
        else if (!timeout) {
            return delay(interval).then(check);
        }
        else {
            return Promise.resolve();
        }
    })();
}

type ReturnPromiseType<T> = T extends (...args: any) => Promise<infer R>
    ? R
    : T extends (...args: any) => infer R
        ? R
        : any;

/** 防抖动函数包装 */
export function debounce<T extends AnyFunction>(cb: T): (...args: Parameters<T>) => Promise<ReturnPromiseType<T>>;
export function debounce<T extends AnyFunction>(delay: number, cb: T): (...args: Parameters<T>) => Promise<ReturnPromiseType<T>>;
export function debounce<T extends AnyFunction>(delay: number | T, cb?: T): (...args: Parameters<T>) => Promise<ReturnPromiseType<T>> {
    let timer: ReturnType<typeof setTimeout>;
    let time: number, cbt: T;

    if (typeof delay === 'function') {
        cbt = delay;
        time = 200;
    }
    else {
        cbt = cb as T;
        time = delay;
    }

    let _resolve: (value?: ReturnPromiseType<T> | PromiseLike<ReturnPromiseType<T>> | undefined) => void;
    let _reject: (error: any) => void;

    const end = new Promise<ReturnPromiseType<T>>((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
    });

    return function delayInDebounce(...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            try {
                const result = cbt(...args);

                if (result && isFunc(result.then)) {
                    result.then(_resolve);
                }
                else {
                    _resolve(result);
                }
            }
            catch (e) {
                _reject(e);
            }
        }, time);

        return end;
    };
}

/** 限制异步函数并发数量 */
export function concurrent(fn: () => Promise<void>, limit = 1): () => Promise<void> {
    let count = 0;

    return function currentFunc() {
        if (count >= limit) {
            return Promise.resolve();
        }

        // 并发计数器 + 1
        count++;

        return fn().finally(() => count--);
    };
}

interface RunLimit<T extends AnyFunction> {
    /** 被包裹的函数本体 */
    (...args: Parameters<T>): ReturnType<T>;
    /** 重置运行次数计数器 */
    reset(): void;
}

/** 限制函数运行次数 */
export function runCountLimit<T extends AnyFunction>(func: T, limit = 1): RunLimit<T> {
    let count = 0;
    let lastResult: ReturnType<T>;

    const countFunc: RunLimit<T> = function countFunc(...args: Parameters<T>) {
        if (count >= limit) {
            return lastResult;
        }

        // 计数器 + 1
        count++;

        lastResult = func(...args);

        return lastResult;
    };

    countFunc.reset = () => {
        count = 0;
    };

    return countFunc;
}
