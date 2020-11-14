import { useForceUpdate } from 'src/use';
import { mapState, MapState } from 'src/store';
import { Point } from 'src/lib/point';

import { RefObject, useEffect, useRef } from 'react';

export function useMap(ref: RefObject<Element>) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.current === 'undefined') {
          console.error('useMap expects a single ref argument.');
        }
    }

    const { current: map } = useRef(mapState.data);
    const update = useForceUpdate();
    const setMap = (val: Partial<MapState>) => {
        (map as MapState).zoom = val.zoom ?? map.zoom;
        (map as MapState).position = val.position ?? map.position;

        mapState.setData({
            ...mapState.data,
            ...val,
        });

        update();
    };

    useEffect(() => {
        const whellHandler = (e: WheelEvent) => {
            if (ref && ref.current) {
                const mousePosition = new Point(e.pageX, e.pageY);
                let size = map.zoom * 20;

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
                    position: map.position
                        .add(mousePosition, -1)
                        .mul(size / map.zoom)
                        .add(mousePosition)
                        .round(1),
                });
            }
        };
    
        document.addEventListener('wheel', whellHandler);
    
        return () => {
            document.removeEventListener('wheel', whellHandler);
        };
    }, [ref]);

    return map;
}
