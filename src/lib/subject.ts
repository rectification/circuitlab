import { isFunc } from 'src/utils/assert';

type EventHandler<T = any> = (...payloads: T[]) => any;
type ReadonlyObject<T> = T extends AnyObject ? Readonly<T> : T;

type GetWatcherType<W> = W extends Watcher<infer R> ? R : never;
type GetWatcherListType<W extends readonly Watcher<any>[]> = { [K in keyof W]: GetWatcherType<W[K]> };
type CreateWtacherList<V extends readonly any[]> = { [K in keyof V]: Watcher<V[K]> };

/** 频道订阅者 */
export class ChannelSubject {
    /** 事件数据 */
    private _events: Record<string, EventHandler[]> = {};

    /** 注册观测器 */
    observe(name: string, ev: EventHandler) {
        const { _events: events } = this;

        if (!events[name]) {
            events[name] = [];
        }

        events[name].push(ev);

        /** 返回取消观测器方法 */
        return function unObserve() {
            events[name] = events[name].filter((cb) => cb !== ev);
        };
    }

    /** 取消全部观测器 */
    unObserve(): void;
    /** 取消此回调的观测器 */
    unObserve(ev: EventHandler): void;
    /** 取消此类全部观测器 */
    unObserve(name: string): void;
    /** 取消此类中的某个回调观测器 */
    unObserve(name: string, ev: EventHandler): void;

    unObserve(name?: string | EventHandler, ev?: EventHandler) {
        // 没有参数输入
        if (!name) {
            this._events = {};
        }
        // 只输入一个参数
        else if (!ev) {
            if (typeof name === 'string') {
                if (this._events[name]) {
                    this._events[name] = [];
                }
            }
            else if (typeof name === 'function') {
                Object.keys(this._events).forEach((key) => {
                    this._events[key] = this._events[key].filter((cb) => cb !== ev);
                });
            }
        }
        // 输入两个参数
        else if (name && ev) {
            const key = name as string;

            if (this._events[key]) {
                this._events[key] = this._events[key].filter((cb) => cb !== ev);
            }
        }
    }

    /** 发布变化 */
    notify(name: string, ...payloads: any[]) {
        const { _events: events } = this;

        if (!events[name]) {
            return;
        }

        events[name].forEach((cb) => cb(...payloads));
    }
}

/** 订阅者 */
export class Subject<T> {
    /** 事件数据 */
    private _events: EventHandler<T>[] = [];

    /** 注册观测器 */
    observe(ev: EventHandler<T>) {
        // 添加观测器
        this._events.push(ev);
        // 返回注销观测器的函数
        return () => this.unObserve(ev);
    }

    /** 注销全部观测器 */
    unObserve(): void;
    /** 注销此回调的观测器 */
    unObserve(ev: EventHandler<T>): void;

    unObserve(ev?: EventHandler<T>) {
        if (!ev) {
            this._events = [];
        }
        else {
            this._events = this._events.filter((cb) => cb !== ev);
        }
    }

    /** 发布变化 */
    notify(newVal: T, lastVal: T) {
        this._events.forEach((cb) => cb(newVal, lastVal));
    }
}

/** 监控者 */
export class Watcher<T> extends Subject<T> {
    static computed<
        Watchers extends readonly Watcher<any>[],
        Params extends GetWatcherListType<Watchers>,
        Values extends readonly any[],
    >(watchers: Watchers, cb: (...args: Params) => Values): CreateWtacherList<Values> {
        const initVals = cb(...watchers.map(({ _data }) => _data) as any);
        const newWatchers = initVals.map((init) => new Watcher(init));

        // 更新所有观测器的回调
        const observeCb = () => {
            const current: Params = watchers.map(({ _data }) => _data) as any;
            cb(...current).forEach((val, i) => {
                newWatchers[i].setData(val);
            });
        };

        // 绑定回调
        watchers.forEach((watcher) => watcher.observe(observeCb));

        return newWatchers as any;
    }

    /** 原始值 */
    protected _data: T;

    get data(): ReadonlyObject<T> {
        return this._data as any;
    }

    constructor(initVal: T) {
        super();
        this._data = initVal;
    }

    /** 设置值 */
    setData(val: T) {
        if (val !== this._data) {
            const last = this._data;

            this._data = val;
            this.notify(val, last);
        }
    }

    /**
     * 绑定监听器
     *  - `event`监听器回调
     *  - `immediately`是否立即运行
     */
    observe(event: EventHandler<T>, immediately = false) {
        const unObserve = super.observe(event);

        // 只运行当前回调
        if (immediately) {
            event(this._data);
        }

        return unObserve;
    }

    /** 监听一次变化 */
    once(val?: T | ((item: T) => boolean)) {
        const func = arguments.length === 0
            ? () => true
            : isFunc(val)
                ? val
                : (item: T) => item === val;

        return new Promise<ReadonlyObject<T>>((resolve) => {
            const callback = (item: T) => {
                if (func(item)) {
                    this.unObserve(callback);
                    resolve(item as ReadonlyObject<T>);
                }
            };

            this.observe(callback);
        });
    }
    /** 扩展并生成新的监控器 */
    computed<U>(cb: (val: T) => U): Watcher<U> {
        const watcher = new Watcher(cb(this._data));
        this.observe((val) => watcher.setData(cb(val)));
        return watcher;
    }
}
