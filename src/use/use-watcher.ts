import { useForceUpdate } from './use-force-update';

import { useRef, useEffect } from 'react';

import { Watcher } from 'src/lib/subject';
import { BaseType, isBaseType } from 'src/utils/assert';

export function useWatcher<T extends BaseType>(watcher: Watcher<T>): [T, (val: T) => void];
export function useWatcher<T extends AnyObject>(watcher: Watcher<T>): [Readonly<T>, (val: Partial<T>) => void];
export function useWatcher<T>(watcher: Watcher<T>) {
    const update = useForceUpdate();
    const state = useRef(watcher.data);
    const setStatus = isBaseType(watcher.data)
        ? (val: T) => watcher.setData(val)
        : (val: Partial<T>) => watcher.setData({
            ...state.current,
            ...val,
        });

    function handleChange(val: T) {
        debugger;
        state.current = val as any;
        update();
    }

    useEffect(() => {
        watcher.observe(handleChange);
        return () => watcher.unObserve(handleChange);
    }, []);

    return [state.current, setStatus] as const;
}

interface ListActions<U, T extends Array<U>> {
    reset: (newList: T) => void;
    push: (...items: U[]) => void;
    pop: () => U | undefined;
    remove: (index: number) => void;
    clear: () => void;
}

export function useWatcherList<U, T extends Array<U>>(watcher: Watcher<T>) {
    const update = useForceUpdate();
    const state = useRef(watcher.data);
    const setStatus = (val: T) => watcher.setData(val);
    const methods: ListActions<U, T> = {
        reset: (newList: T) => setStatus(newList),
        push(...items: U[]) {
            const newList = state.current.slice();
            newList.push(...items);
            setStatus(newList as any);
        },
        pop() {
            const newList = state.current.slice();
            const result = newList.pop();
            setStatus(newList as any);
            return result;
        },
        remove(index: number) {
            const newList = state.current.slice();
            newList.slice(index, 1);
            setStatus(newList as any);
        },
        clear() {
            setStatus([] as any);
        },
    };

    function handleChange(val: T) {
        state.current = val as any;
        update();
    }

    useEffect(() => {
        watcher.observe(handleChange);
        return () => watcher.unObserve(handleChange);
    }, []);

    return [state.current, methods] as const;
}
