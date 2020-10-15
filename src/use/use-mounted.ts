import { useCallback, useEffect, useRef } from 'react';

export function useMounted(): () => boolean {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    });

    return get;
}
