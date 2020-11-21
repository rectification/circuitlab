import { useForceUpdate } from 'src/use';
import { Point } from 'src/lib/point';

import { RefObject, useEffect, useRef } from 'react';

export interface MapState {
    zoom: number;
    position: Point;
}

export const mapStateDefault: MapState = {
    zoom: 1,
    position: Point.from(0),
};

export function useMap(ref: RefObject<SVGSVGElement>) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.current === 'undefined') {
          console.error('useMap expects a single ref argument.');
        }
    }

    const update = useForceUpdate();
    const { current: state } = useRef(mapStateDefault);
    const setMap = (val: Partial<MapState>) => {
        Object.assign(state, val);
        update();
    };

    useEffect(() => {
        const wheelHandler = (e: WheelEvent) => {
            if (ref && ref.current) {
                const mousePosition = new Point(e.pageX, e.pageY);
                let size = state.zoom * 20;

                if (e.deltaY > 0) {
                    size -= 5;
                }
                else if (e.deltaY < 0) {
                    size += 5;
                }

                if (size < 20) {
                    size = 20;
                    return;
                }
                if (size > 80) {
                    size = 80;
                    return;
                }

                size = size / 20;

                setMap({
                    zoom: size,
                    position: state.position
                        .add(mousePosition, -1)
                        .mul(size / state.zoom)
                        .add(mousePosition)
                        .round(1),
                });
            }
        };

        ref.current?.addEventListener('wheel', wheelHandler);
    
        return () => {
            ref.current?.removeEventListener('wheel', wheelHandler);
        };
    }, [ref.current]);

    return { ...state };
}
