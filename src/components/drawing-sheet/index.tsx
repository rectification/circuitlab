import React from 'react';
import styles from './index.styl';

import { useRef } from 'react';
import { Line } from '../electronic-line';
import { Part } from '../electronic-part';
import { Point } from 'src/lib/point';
import { useWatcher, useWatcherList } from 'src/use';

import * as store from 'src/store';

function getBackgroundStyle(zoom: number, position: Point) {
    const size = zoom * 20;
    const biasX = position[0] % size;
    const biasY = position[1] % size;

    return {
        backgroundSize: `${size}px`,
        backgroundPosition: `${biasX}px ${biasY}px`,
    };
}

export function DrawingSheet() {
    const [map, setMap] = useWatcher(store.mapState);
    const [lines] = useWatcherList(store.lines);
    const [parts] = useWatcherList(store.parts);

    /** 重置图纸大小 */
    const resizeMap = (e: React.WheelEvent) => {
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
    };

    return (
        <section
            style={getBackgroundStyle(map.zoom, map.position)}
            id={styles.drawingSheet}>
            <svg
                height='100%'
                width='100%'
                onWheel={resizeMap}>
                <g>
                </g>
            </svg>
        </section>
    );
}
