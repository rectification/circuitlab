import { Point } from 'src/lib/point';
import { Matrix } from 'src/lib/matrix';

/** 器件类型枚举常量 */
export const enum PartKind {
    /** 电阻 */
    Resistance = 1,
    /** 电感 */
    Inductance,
    /** 电容 */
    Capacitor,
    /** 电流测量 */
    CurrentMeter,
    /** 电压测量 */
    VoltageMeter,
    /** 运算放大器 */
    OperationalAmplifier,
    /** 二极管 */
    Diode,
    /** npn 三极管 */
    TransistorNPN,
    /** 交流电压源 */
    AcVoltageSource,
    /** 直流电流源 */
    DcCurrentSource,
    /** 直流电压源 */
    DcVoltageSource,
    /** 参考地 */
    ReferenceGround,
}

/** 器件数据 */
export interface PartData {
    kind: PartKind;
    id: number;
    rotate: Matrix;
    position: Point;
    connect: string[];
}

/** 器件引用接口 */
export interface PartRef {

}
