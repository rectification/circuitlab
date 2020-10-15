import { useState } from 'react';

enum PromiseStatus {
    Pending,
    Fulfilled,
    Rejected,
}

/**
 * Promise 状态
 * @return [boolean, PromiseStatus]
 *  - boolean 是否还在等待中
 *  - PromiseStatus 当前状态：`0` Pending，`1` Fulfilled，`2` Rejected
 */
export function usePromiseState(promise: Promise<any>) {
    const [state, setState] = useState(PromiseStatus.Pending);

    promise
        .then(() => setState(PromiseStatus.Fulfilled))
        .catch(() => setState(PromiseStatus.Rejected));

    return [state === PromiseStatus.Pending, state] as const;
}
