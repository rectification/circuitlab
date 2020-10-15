import { useState, useEffect } from 'react';

export function useFollow<T>(prop: T) {
    const [state, setState] = useState(prop);

    useEffect(() => {
        setState(prop);
    }, [prop]);

    return [state, setState] as const;
}
