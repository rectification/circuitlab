import { Point } from 'src/lib/point';
import { createContext } from 'react';

import { MapState, mapStateDefault } from './map';

export interface MapContext {
    map: MapState;
}

export const mapContext = createContext<MapContext>({
    map: { ...mapStateDefault },
});
