import { Point } from 'src/lib/point';
import { Matrix } from 'src/lib/matrix';

/** 导线类型枚举常量 */
export enum LineKind {
    Line = 0,
}

/** 导线数据 */
export interface LineData {
    kind: LineKind,
    id: number;
    points: Point[];
    connect: string[];
}

/** 导线引用接口 */
export interface LineRef {

}
