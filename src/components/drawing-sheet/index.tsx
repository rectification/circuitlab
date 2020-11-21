import React from 'react';
import classnames from 'classnames';
import styles from './index.styl';

import { useRef } from 'react';
import { Point } from 'src/lib/point';
import { useWatcher, useWatcherList } from 'src/use';

import { Line, LineRef } from '../electronic-line';
import { Part, PartRef } from '../electronic-part';

import * as store from 'src/store';
import * as utils from './utils';

import { useMap } from './map';
import { useMouseBus } from './mouse';
import { mapContext } from './context';

export {
    mapContext,
    MapContext,
} from './context';

export {
    MapState,
} from './map';

export function DrawingSheet() {
    const [lines] = useWatcherList(store.lines);
    const [parts] = useWatcherList(store.parts);
    const SheetRef = useRef<SVGSVGElement>(null);
    const lineRefs = useRef<LineRef[]>([]);
    const partRefs = useRef<PartRef[]>([]);
    const eventBus = useMouseBus(SheetRef);
    const map = useMap(SheetRef);

    return (
        <section
            className={classnames(styles.drawingSheet)}
            style={utils.getBackgroundStyle(map.zoom, map.position)}>
            <svg height='100%' width='100%' ref={SheetRef}>
                <mapContext.Provider value={{ map }}>
                    <g transform={`translate(${map.position.join(',')}) scale(${map.zoom})`}>
                        {lines.map((data) => <Line key={data.id} ref={lineRefs} {...data} />)}
                        {parts.map((data) => <Part key={data.id} ref={partRefs} {...data} />)}
                    </g>
                </mapContext.Provider>
            </svg>
        </section>
    );
}
