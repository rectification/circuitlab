import { useCallback, useState } from 'react';

export function useForceUpdate() {
    const [, dispatch] = useState(Object.create(null));

    // 设置新参数，强制更新
    const memoizedDispatch = useCallback(
        () => dispatch(Object.create(null)),
        [dispatch],
    );

    return memoizedDispatch;
}
