import { Watcher } from 'src/lib/subject';
import { Point } from 'src/lib/point';

import { LineData } from 'src/components/electronic-line';
import { PartData } from 'src/components/electronic-part';

interface MapState {
    zoom: number;
    position: Point;
}

export const mapState = new Watcher<MapState>({
    zoom: 1,
    position: Point.from(0),
});

export const lines = new Watcher<LineData[]>([]);
export const parts = new Watcher<PartData[]>([]);
