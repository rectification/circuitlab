import { Matrix } from './matrix';
import { isNumber } from 'src/utils/assert';

export type PointLike = number[] | Point;
export type PointInput = PointLike | number;

/**
 * 点和向量类
 *
 * @class Point
 */
export class Point {
    0: number;
    1: number;
    readonly length!: 2;

    /**
     * 创建一个点或者向量
     * @param {PointInput} start
     * @param {PointInput} end
     */
    constructor(start: number, end: number);
    constructor(start: PointLike, end: PointLike);
    constructor(start: PointInput, end: PointInput) {
        // 输入两个数 -> 点
        if (isNumber(start)) {
            this[0] = start;
            this[1] = end as number;
        }
        // 输入两个点 -> 向量
        else {
            this[0] = end[0] - start[0];
            this[1] = end[1] - start[1];
        }

        Object.defineProperty(this, 'length', {
            writable: false,
            enumerable: false,
            configurable: false,
            value: 2,
        });
    }

    /**
     * 从类似 Point 结构的数据中创建 Point
     */
    static from(start: PointInput) {
        if (isNumber(start)) {
            return new Point(start, start);
        }
        else {
            return new Point(start[0], start[1]);
        }
    }

    /**
     * 迭代器函数
     *  - 用于解构赋值
     *
     * @returns {Generator}
     */
    [Symbol.iterator] = Array.prototype[Symbol.iterator];

    /**
     * 判断`this`与`point`是否相等
     *  - 此处的相等将会兼容`[number, number]`类型
     *
     * @param {PointLike} point
     * @returns {boolean}
     * @memberof Point
     */
    isEqual(point: PointLike): boolean {
        return (
            point.length === 2 &&
            this[0] === point[0] &&
            this[1] === point[1]
        );
    }

    /**
     * 加法
     *  - 第一项将会调用 Point 构造函数生成实例，然后参与运算
     *  - 第二项输入 -1 表示是减法，且 this 是被减数
     *
     * @param {PointInput} added
     * @param {number} [label=1]
     * @returns {Point}
     */
    add(added: PointInput, label = 1): Point {
        const sum = new Point(0, 0);
        if (isNumber(added)) {
            sum[0] = this[0] + added * label;
            sum[1] = this[1] + added * label;
        }
        else {
            sum[0] = this[0] + added[0] * label;
            sum[1] = this[1] + added[1] * label;
        }
        return (sum);
    }
    /**
     * 乘法
     *  - 第一项将会调用 Point 构造函数生成实例，然后参与运算
     *  - 第二项输入 -1 表示是除法，且 this 是被除数
     *
     * @param {PointInput} multiplier
     * @param {number} [label=1]
     * @returns {Point}
     */
    mul(multiplier: PointInput, label = 1): Point {
        const sum = new Point(0, 0);
        if (isNumber(multiplier)) {
            sum[0] = this[0] * ((label < 0) ? (1 / multiplier) : multiplier);
            sum[1] = this[1] * ((label < 0) ? (1 / multiplier) : multiplier);
        }
        else {
            sum[0] = this[0] * ((label < 0) ? (1 / multiplier[0]) : multiplier[0]);
            sum[1] = this[1] * ((label < 0) ? (1 / multiplier[1]) : multiplier[1]);
        }
        return (sum);
    }
    /**
     * 向量乘法
     *
     * @param {PointLike} vector
     * @returns {number}
     */
    product(vector: PointLike): number {
        return (this[0] * vector[0] + this[1] * vector[1]);
    }
    /**
     * 点旋转（乘以矩阵）
     * @param {Matrix} ma
     * @returns {Point}
     */
    rotate(ma: Matrix) {
        return new Point(
            this[0] * ma.get(0, 0) + this[1] * ma.get(1, 0),
            this[0] * ma.get(0, 1) + this[1] * ma.get(1, 1),
        );
    }
    /**
     * 返回对 x, y 坐标分别求绝对值后组成的新 Point 实例
     *
     * @returns {Point}
     */
    abs(): Point {
        return (new Point(
            Math.abs(this[0]),
            Math.abs(this[1]),
        ));
    }
    /**
     * 返回 x, y 坐标分别单位化后组成的新 Point 实例
     *
     * @returns {Point}
     */
    sign(): Point {
        return (new Point(
            Math.sign(this[0]),
            Math.sign(this[1]),
        ));
    }
    /**
     * 求 this 到 point 的几何距离
     *
     * @param {PointLike} [point]
     * @returns {number}
     */
    distance(point: PointLike = [0, 0]): number {
        return Math.hypot(
            (this[0] - point[0]),
            (this[1] - point[1]),
        );
    }
    /**
     * this 在`vector`上的投影向量
     *
     * @param {Point} vector 投影向量
     * @returns {Point}
     */
    toProjection(vector: Point) {
        return vector.mul(this.product(vector) / vector.distance());
    }
    /**
     * 求与 this 平行且模为 factor 的向量
     *
     * @param {number} [factor=1]
     * @returns {Point}
     */
    toUnit(factor = 1) {
        const scale = 1 / this.distance();
        return this.mul(scale * factor);
    }
    /**
     * this 顺时针旋转 90°
     *  - x 轴向右为正，y 轴向下为正
     *
     * @param {number} [factor=1]
     * @returns {Point}
     */
    toVertical() {
        return new Point(-this[1], this[0]);
    }
    /**
     * x, y 分别对 n 的余数四舍五入
     *
     * @param {number} [fixed=20]
     * @returns {Point}
     */
    round(fixed = 20): Point {
        return (new Point(
            Number.parseInt((this[0] / fixed).toFixed(), 10) * fixed,
            Number.parseInt((this[1] / fixed).toFixed(), 10) * fixed,
        ));
    }
    /**
     * 对 x, y 分别除以 n, 然后四舍五入
     *
     * @param {number} [fixed=20]
     * @returns {Point}
     */
    roundToSmall(fixed = 20): Point {
        return (new Point(
            Number.parseInt((this[0] / fixed).toFixed(), 10),
            Number.parseInt((this[1] / fixed).toFixed(), 10),
        ));
    }
    /**
     * x, y 分别对 n 的余数向下取整
     *
     * @param {number} [fixed=20]
     * @returns {Point}
     */
    floor(fixed = 20): Point {
        return (new Point(
            Math.floor(this[0] / fixed) * fixed,
            Math.floor(this[1] / fixed) * fixed,
        ));
    }
    /**
     * 对 x, y 分别除以 n, 然后向下取整
     *
     * @param {number} [fixed=20]
     * @returns {Point}
     */
    floorToSmall(fixed = 20): Point {
        return (new Point(
            Math.floor(this[0] / fixed),
            Math.floor(this[1] / fixed),
        ));
    }
    /**
     * 是否是零向量
     *
     * @returns {boolean}
     */
    isZero(): boolean {
        return (this[0] === 0 && this[1] === 0);
    }
    /**
     * 是否是整数点
     *
     * @returns {boolean}
     */
    isInteger(): boolean {
        return (
            this.length === 2 &&
            Number.isInteger(this[0]) &&
            Number.isInteger(this[1])
        );
    }
    /**
     * 是否和输入向量平行
     *
     * @param {PointLike} vector
     * @returns {boolean}
     */
    isParallel(vector: PointLike): boolean {
        return (this[0] * vector[1] === this[1] * vector[0]);
    }
    /**
     * 是否和输入向量垂直
     *
     * @param {PointLike} vector
     * @returns {boolean}
     */
    isVertical(vector: PointLike): boolean {
        return ((this[0] * vector[0] + this[1] * vector[1]) === 0);
    }
    /**
     * 是否和输入向量方向相同
     *
     * @param {PointLike} vector
     * @returns {boolean}
     */
    isSameDirection(vector: PointLike): boolean {
        return (
            // 0 向量与任意向量的方向都相同
            this.isZero() || (this.isZero.call(vector) as boolean) ||
            // 非零向量
            (
                this.isParallel(vector) &&
                (vector[0] * this[0] > 0 || vector[1] * this[1] > 0)
            )
        );
    }
    /**
     * 是否和输入向量方向相反
     *
     * @param {PointLike} vector
     * @returns {boolean}
     */
    isOppoDirection(vector: PointLike): boolean {
        return (
            // 0 向量与任意向量的方向都相反
            this.isZero() || (this.isZero.call(vector) as boolean) ||
            // 非零向量
            (
                this.isParallel(vector) &&
                (vector[0] * this[0] < 0 || vector[1] * this[1] < 0)
            )
        );
    }
    /**
     * 是否在线段内
     *
     * @param {PointLike[]} segment
     * @returns {boolean}
     */
    isInLine(segment: PointLike[]): boolean {
        // 点到线段两端的向量方向相反，即表示其在线段内
        const toStart = new Point(this, segment[0]);
        const toEnd = new Point(this, segment[1]);

        return (
            toEnd.isZero() ||
            toStart.isZero() ||
            toStart.isOppoDirection(toEnd)
        );
    }
    /**
     * 以 this 为中心、rect 为四角顶点，遍历其中所有整数节点
     *
     * @param {number[][]} margin
     * @param {(node: Point) => boolean} predicate
     * @returns {boolean}
     */
    everyRect(rect: number[][], predicate: (node: Point) => boolean): boolean {
        for (let i = this[0] + rect[0][0]; i <= this[0] + rect[1][0]; i++) {
            for (let j = this[1] + rect[0][1]; j <= this[1] + rect[1][1]; j++) {
                if (!predicate(new Point(i, j))) {
                    return (false);
                }
            }
        }
        return (true);
    }
    /**
     * 以 this 为中心点，过滤距离中心点距离为 factor 的所有点，返回使 predicate 输出 true 的点的集合
     *
     * @param {(point: Point) => boolean} predicate
     * @param {number} [factor=1]
     * @returns {Point[]}
     */
    around(predicate: (point: Point) => boolean, factor = 1): Point[] {
        const ans: Point[] = predicate(this) ? [Point.from(this)] : [];

        for (let m = 1; ans.length < 1; m++) {
            for (let i = 0; i < m; i++) {
                const x = i * factor, y = (m - i) * factor;
                const around = (x === 0)
                    ? [[0, y], [0, -y], [y, 0], [-y, 0]]
                    : [[x, y], [x, -y], [-x, y], [-x, -y]];

                const points = around.map((n) => this.add(n));

                ans.push(...points.filter(predicate));

                if (ans.length > 0) {
                    break;
                }
            }
        }
        return ans;
    }
    /**
     * 求 points 中与 this 距离最近的点
     *
     * @param {PointLike[]} points
     * @returns {(undefined | Point)}
     */
    closest(points: PointLike[]) {
        if (points.length === 0) {
            throw new Error('(point) points can not be a empty array.');
        }

        return Point.from(points.reduce(
            (pre, next) =>
                this.distance(pre) < this.distance(next) ? pre : next,
        ));
    }
    /**
     * 求 vectors 中与 this 夹角最小的向量
     *
     * @param {PointLike[]} vectors
     * @returns {Point}
     */
    minAngle(vectors: PointLike[]) {
        if (vectors.length === 0) {
            throw new Error('(point) vectors can not be a empty array.');
        }

        function cosAB(a: PointLike, b: PointLike): number {
            return (
                Point.prototype.product.call(a, b) /
                Point.prototype.distance.call(a, [0, 0]) /
                Point.prototype.distance.call(b, [0, 0])
            );
        }

        return Point.from(vectors.reduce(
            (pre, next) =>
                cosAB(this, pre) > cosAB(this, next) ? pre : next,
        ));
    }
    /**
     * 以当前点为左上角，生成四方格坐标
     *
     * @param {number} [len=20]
     * @returns {[Point, Point, Point, Point]}
     */
    toGrid(len = 20): [Point, Point, Point, Point] {
        return ([
            new Point(this[0], this[1]),
            new Point(this[0] + len, this[1]),
            new Point(this[0], this[1] + len),
            new Point(this[0] + len, this[1] + len),
        ]);
    }
    /**
     * 将坐标用 str 连接成字符串
     *
     * @param {string} [str=',']
     * @returns
     */
    join(str: string = ',') {
        return `${this[0]}${str}${this[1]}`;
    }
    /**
     * map 迭代，同`Array.prototype.map`
     *
     * @template T
     * @param {(value: number, index: number) => T} callback
     * @returns {[T, T]}
     */
    map<T>(callback: (value: number, index: number) => T): [T, T] {
        return [callback(this[0], 0), callback(this[1], 1)];
    }
}

type PointMethodKeys = Exclude<keyof Point, 0 | 1 | 'length'>;
/**
 * Point 原型函数封装
 *  - 主要用于 PointLike 型输入
 */
export function PointCall<T extends PointMethodKeys>(self: PointLike, name: T, ...args: Parameters<Point[T]>): ReturnType<Point[T]> {
    return (Point.prototype as any)[name].call(self, ...args);
}
