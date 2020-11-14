import React from 'react';

import { PartData, PartRef } from './types';
import { useImperativeHandle, ForwardRefRenderFunction, forwardRef } from 'react';

export * from './types';

const Render: ForwardRefRenderFunction<PartRef, PartData> = (props, ref) => {
    useImperativeHandle(ref, (): PartRef => ({
        key: 123,
    }));

    return <g index-id={props.id}></g>;
}

export const Part = forwardRef(Render);
