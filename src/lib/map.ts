import { Point, PointLike, PointCall } from 'src/lib/point';

import { def, clone } from 'src/utils/object';
import { unique, removeVal } from 'src/utils/array';

/** 节点类型常量 */
export enum NodeType {
    /** 导线 */
    Line = 10,
    /** 导线空节点 */
    LinePoint,
    /** 导线交叠节点（实际并不相交） */
    LineCoverPoint,
    /** 导线交错节点 */
    LineCrossPoint,

    /** 器件节点 */
    Part = 20,
    /** 器件引脚节点 */
    PartPoint,
}

export interface NodeData {
    /** 当前点属于哪个器件 */
    id: string;
    /** 当前点的小坐标（其乘以 20 才是实际坐标） */
    point: Point;
    /** 当前点的类型 */
    type: NodeType;
    /** 当前点在图纸中连接着另外哪些点 */
    connect: Point[];
}

export type MapHash = AnyObject<NodeData>;
export type NodeInputData = PartPartial<NodeData, 'connect'>;
export type NodeUpdateData = Omit<PartPartial<NodeData, 'connect'>, 'point'>;

/**
 * 图纸标记缓存
 *  - key 是使用小坐标转换而来的，而内部数据中的 point 则是实际坐标
 */
const $map: MapHash = {};

/** 用于缓存强制更新的 string 数据 */
let $mapString = '';

/**
 * 将坐标转化为标记数据中的键值
 *
 * @param {PointLike} node
 * @returns {string}
 */
function point2key(node: PointLike): string {
    return node.join(',');
}

/**
 * 返回地图标记数据的副本
 * @param {NodeInputData} data 原始数据
 * @returns {NodeData}
 */
function dataClone(data: NodeInputData): NodeData {
    return {
        id: data.id,
        type: data.type,
        point: Point.from(data.point),
        connect: data.connect ? data.connect.map(Point.from) : [],
    };
}

/**
 * 将整个图纸数据用 JSON 字符串的形式输出
 *
 * @returns {string}
 */
export function outputMap() {
    const copy = clone($map);

    Object.values(copy).forEach((data) => {
        if (data.connect.length === 0) {
            // TODO:
            // delete data.connect;
        }
        else {
            data.connect = data.connect.map((item) => Array.from(item)) as any;
        }

        // TODO:
        // delete data.point;
    });

    return JSON.stringify(copy);
}

// 调试阶段，导出函数为全局函数
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
    def(window, { $outputMap: outputMap });
}

/**
 * 将数据写入图纸标记
 *  - 写入的数据是当前数据的副本
 *  - 如果指定点已经有数据，那么当前数据会直接覆盖它
 *
 * @export
 * @param {NodeData} data
 * @param {boolean} [large=false]
 */
export function setPoint(data: NodeInputData, large = false): void {
    data.point = large ? data.point.mul(0.05) : Point.from(data.point);
    $map[point2key(data.point)] = dataClone(data);
}

/**
 * 强制更新所有图纸标记
 *
 * @param {string} [map='{}']
 * @param {boolean} [checkCache=false]
 * @return {void}
 */
export function forceUpdateMap(map = '{}', checkCache = false) {
    // 校验缓存
    if (checkCache && map === $mapString) {
        return;
    }

    const data = JSON.parse(map) as AnyObject<NodeUpdateData>;

    // 删除当前所有数据
    Object
        .keys($map)
        .forEach((key) => Reflect.deleteProperty($map, key));

    Object.entries(data).forEach(([key, value]) => {
        // 节点坐标由 key 转变而来
        const point = Point.from(key.split(',').map(Number));
        // 设置节点信息
        setPoint(dataClone({ ...value, point }));
    });

    $mapString = map;
}

/**
 * 将当前数据与 $map 中已有的数据进行合并
 *  - 写入的数据是当前数据的副本
 *  - 如果指定的点没有数据，那么将会直接写入当前数据
 *  - 合并规则如下：
 *    - point 不变
 *    - id, type 直接覆盖
 *    - connect 将会取两者的并集
 *
 * @export
 * @param {NodeData} data
 * @param {boolean} [large=false]
 */
export function mergePoint(data: NodeInputData, large = false): void {
    data.point = large ? data.point.mul(0.05) : Point.from(data.point);

    const key = point2key(data.point);
    const newData = dataClone(data);
    const oldData = $map[key];

    if (!oldData) {
        $map[key] = newData;
    }
    else {
        newData.connect = newData.connect.concat(oldData.connect);
        newData.connect = unique(newData.connect, point2key);
    }

    $map[key] = newData;
}

/**
 * 此点是否含有数据
 *
 * @param {PointLike} point
 * @returns {boolean}
 */
export function hasPoint(point: PointLike, large = false): boolean {
    const node = large ? PointCall(point, 'mul', 0.05) : point;
    return Boolean($map[point2key(node)]);
}

/**
 * 拿到 Map 中的标记数据
 *  - 这里拿到的数据只是副本，直接对这个对象进行操作并不会影响原数据
 *
 * @export
 * @param {PointLike} point
 * @param {boolean} [large=false]
 * @returns {(NodeData | false)}
 */
export function getPoint(point: PointLike, large = false): NodeData | undefined {
    const node = large ? PointCall(point, 'mul', 0.05) : Point.from(point);
    const data = $map[point2key(node)];

    return data ? dataClone(data) : undefined;
}

/**
 * 删除指定点数据，返回操作是否成功
 *
 * @returns {boolean}
 */
export function deletePoint(point: PointLike, large = false) {
    const node = large ? PointCall(point, 'mul', 0.05) : Point.from(point);
    return Reflect.deleteProperty($map, point2key(node));
}

/**
 * point 点是否连接了 connect
 *  - 如果 point 没有 connect 属性，则会输出 false，并再控制台显示警告
 *  - 如果 point, connect 在数学意义上是相等的，则输出 false
 *
 * @export
 * @param {PointLike} point
 * @param {PointLike} connect
 * @param {boolean} [large=false]
 * @returns {boolean}
 */
export function hasConnect(point: PointLike, connect: PointLike, large = false): boolean {
    const origin = large ? PointCall(point, 'mul', 0.05) : point;
    const check = large ? PointCall(connect, 'mul', 0.05) : connect;
    const key = point2key(origin);
    const data = $map[key];

    if (!data) {
        throw new Error(`(map) space point: ${key}`);
    }

    return data.connect.some((item) => item.isEqual(check));
}

/**
 * 给指定点添加连接点
 *  - 如果当前点没有 connect ，则放弃操作
 *  - 如果该连接点已经存在，则放弃操作
 *
 * @export
 * @param {PointLike} point
 * @param {PointLike} connect
 * @param {boolean} [large=false]
 * @returns {void}
 */
export function addConnect(point: PointLike, connect: PointLike, large = false): void {
    const origin = large ? PointCall(point, 'mul', 0.05) : Point.from(point);
    const check = large ? PointCall(connect, 'mul', 0.05) : Point.from(connect);
    const key = point2key(origin);
    const data = $map[key];

    if (!data) {
        throw new Error(`(map) space point: ${key}`);
    }

    if (!hasConnect(origin, check)) {
        data.connect.push(check);
    }
}

/**
 * 从当前实例的连接点中删除输入点
 *  - 如果输入点不存在，那么返回 false， 否则返回 true
 *
 * @export
 * @param {PointLike} point
 * @param {PointLike} connect
 * @param {boolean} [large=false]
 * @returns {boolean}
 */
export function deleteConnect(point: PointLike, connect: PointLike, large = false): boolean {
    const origin = large ? PointCall(point, 'mul', 0.05) : Point.from(point);
    const check = large ? PointCall(connect, 'mul', 0.05) : Point.from(connect);
    const key = point2key(origin);
    const data = $map[key];

    if (!data) {
        throw new Error(`(map) space point: ${key}`);
    }

    // TODO:
    // return data.connect.delete((node) => node.isEqual(check));
    return false;
}

/**
 * 当前点是否在导线上
 *
 * @return {boolean}
 */
export function isLine(point: PointLike, large = false) {
    const node = large ? PointCall(point, 'mul', 0.05) : point;
    const data = $map[point2key(node)];

    return Boolean(data) && (data.type < 20);
}

/**
 * 以当前点为起点，沿着 vector 的方向，直到等于输入的 end，或者是导线方向与 vector 不相等的点，输出最后一点坐标
 *
 * @export
 * @param {PointLike} start
 * @param {PointLike} [end=[Infinity, Infinity]]
 * @param {PointLike} [vector=new Point(end, start)]
 * @param {boolean} [large=false]
 * @returns {Point}
 */
export function alongTheLine(
    start: PointLike,
    end: PointLike = [Infinity, Infinity],
    vector: PointLike = new Point(start, end),
    large = false,
): Point {
    const uVector = Point.from(vector).sign();
    const sNode = large ? PointCall(start, 'mul', 0.05) : Point.from(start);
    const eNode = large ? PointCall(end, 'mul', 0.05) : Point.from(end);

    // 起点并不是导线或者起点等于终点，直接返回
    if (!isLine(sNode) || sNode.isEqual(eNode)) {
        return Point.from(start);
    }

    let node = sNode, next = node.add(uVector);
    // 当前点没有到达终点，还在导线所在直线内部，那就前进
    while (isLine(next) && !node.isEqual(eNode)) {
        if (hasConnect(node, next)) {
            node = next;
            next = node.add(uVector);
        }
        else {
            break;
        }
    }

    return large ? node.mul(20) : node;
}
