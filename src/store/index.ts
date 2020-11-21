import { Watcher } from 'src/lib/subject';

import { LineData } from 'src/components/electronic-line';
import { PartData } from 'src/components/electronic-part';

export const lines = new Watcher<LineData[]>([]);
export const parts = new Watcher<PartData[]>([]);
