import React from 'react';

import { LineData, LineRef } from './types';
import { useImperativeHandle, ForwardRefRenderFunction, forwardRef } from 'react';

export * from './types';

const Render: ForwardRefRenderFunction<LineRef, LineData> = (props, ref) => {
    useImperativeHandle(ref, (): LineRef => ({
        key: 123,
    }));

    return <g index-id={props.id}></g>;
}

export const Line = forwardRef(Render);
