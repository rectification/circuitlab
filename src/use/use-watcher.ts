import { useForceUpdate } from './use-force-update';

import { useRef, useEffect } from 'react';

import { Watcher } from 'src/lib/subject';
import { BaseType, isBaseType, isArray } from 'src/utils/assert';

export function useWatcher<T>(watcher: Watcher<T[]>): [T[], (val: T[]) => void];
export function useWatcher<T extends BaseType>(watcher: Watcher<T>): [T, (val: T) => void];
export function useWatcher<T extends AnyObject>(watcher: Watcher<T>): [Readonly<T>, (val: Partial<T>) => void];
export function useWatcher<T>(watcher: Watcher<T>) {
    const update = useForceUpdate();
    const state = useRef(watcher.data);

    const setStatus = (isBaseType(watcher.data) || isArray(watcher.data))
        ? (val: T) => {
            watcher.data = val as any;
        }
        : (val: Partial<T>) => {
            watcher.data = {
                ...state.current,
                ...val,
            };
        };

    function handleChange(val: T) {
        state.current = val as any;
        update();
    }

    useEffect(() => {
        watcher.observe(handleChange);
        return () => watcher.unObserve(handleChange);
    }, []);

    return [state.current, setStatus] as const;
}
