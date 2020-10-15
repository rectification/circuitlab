import { useRef } from 'react';
import { useForceUpdate } from './use-force-update';

export function useReactive<T extends AnyObject>(initVal: T) {
    /** 强制更新 */
    const forceUpdate = useForceUpdate();
    /** 当前状态 */
    const { current: state } = useRef(initVal);

    const reactive = new Proxy(state, {
        set(target, key, value) {
            const result = Reflect.set(target, key, value);
            forceUpdate();
            return result;
        },
    });

    return reactive;
}
