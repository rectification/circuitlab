import {
    isFunc,
    isDef,
} from './assert';

/** 索引类型 */
type Index = string | number;
/** 数组断言函数 */
type Predicate<T> = (value: T, index: number) => boolean;

/**
 * 根据下标取出当前数组元素
 * @template T
 * @param {T[]} arr
 * @param {number} index
 * @returns {T}
 */
export function get<T>(arr: T[], index: number): T {
    const sub = (index >= 0) ? index : arr.length + index;

    if (sub < 0 || sub >= arr.length) {
        throw new Error('(array) index out of bounds.');
    }

    return arr[sub];
}

/**
 * 删除满足条件的元素
 *  - 在原数组中操作
 *  - predicate 为函数时，删除 predicate 返回 true 的元素
 *  - predicate 为非函数时，删除与 predicate 严格相等的元素
 *  - 当 whole 为 false 时，只删除匹配到的第一个元素；为 true 时，删除所有匹配到的元素
 */
export function removeVal<T>(arr: T[], predicate: T | Predicate<T>, whole = true) {
    const fn = isFunc(predicate) ? predicate : (item: T) => item === predicate;

    let index = 0;

    while (index >= 0) {
        index = arr.findIndex(fn);

        if (index !== -1) {
            arr.splice(index, 1);
        }

        if (!whole) {
            break;
        }
    }

    return arr;
}

/**
 * 替换满足条件的元素
 *  - 在原数组不变
 *  - predicate 为函数时，删除 predicate 返回 true 的元素
 *  - predicate 为非函数时，删除与 predicate 严格相等的元素
 */
export function replace<T>(arr: T[], newVal: T, predicate: T | Predicate<T>, whole = false) {
    const fn = isFunc(predicate) ? predicate : (item: T) => item === predicate;

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const compared = fn(item, i);

        if (compared) {
            arr.splice(i, 1, newVal);

            if (!whole) {
                break;
            }
        }
    }

    return arr;
}

/**
 * 数组分组
 *  - 按照输入的数量将数组截断成几节
 */
export function cut<T>(arr: T[], number: number): T[][] {
    const newArr = arr.slice();
    const result: T[][] = [];

    while (newArr.length > 0) {
        result.push(newArr.splice(0, number));
    }

    return result;
}

/**
 * 数组去重
 *  - 如果没有输入 label 函数，则对数组元素直接去重
 *  - 如果输入了 label 函数，将会使用该函数对数组元素做一次转换，对转换之后的值进行去重，最后再映射回原数组
 */
export function unique<T extends Index>(arr: T[]): T[];
export function unique<T>(arr: T[], label: (value: T, index: number) => Index): T[];
export function unique<T>(arr: T[], label?: (value: T, index: number) => Index): T[] {
    let labelMap: Record<Index, boolean> = {};

    if (isDef(label)) {
        return arr
            .map((value, index) => ({ value, key: label(value, index) }))
            .filter(({ key }) => (labelMap[key] ? false : (labelMap[key] = true)))
            .map(({ value }) => value);
    }
    else {
        return arr.filter((key) => (labelMap[key as any] ? false : (labelMap[key as any] = true)));
    }
}

/** 连接数组 */
export function concat<T, U>(from: T[], callback: (val: T) => U | U[] | undefined): U[] {
    let result: U[] = [];

    for (let i = 0; i < from.length; i++) {
        result = result.concat(callback(from[i]) || []);
    }

    return result;
}

/** 转换为数组 */
export function transArr<T>(item?: T | T[]): T[] {
    if (!item) {
        return [];
    }
    else if (!Array.isArray(item)) {
        return [item];
    }
    else {
        return item;
    }
}

type IndexCb<T, U> = (val: T, index: number) => U;

/** 生成`hash`查询表 */
export function toMap<T extends object, U extends Index>(arr: T[], toKey: IndexCb<T, U>): Record<U, T | undefined>;
export function toMap<T extends object, U extends Index, V>(arr: T[], toKey: IndexCb<T, U>, toVal: IndexCb<T, V>): Record<U, V | undefined>
export function toMap<T extends object, U extends Index, V>(arr: T[], toKey: IndexCb<T, U>, toVal?: IndexCb<T, V>) {
    const map: Record<U, any> = {} as any;

    if (toVal) {
        arr.forEach((val, i) => (map[toKey(val, i)] = toVal(val, i)));
    }
    else {
        arr.forEach((val, i) => (map[toKey(val, i)] = val));
    }

    return map;
}

/** 生成`hash`布尔查询表 */
export function toBoolMap<T extends Index>(arr: T[]): Record<T, boolean>;
export function toBoolMap<T, U extends Index>(arr: T[], cb: IndexCb<T, U>): Record<U, boolean>;
export function toBoolMap<T, U extends Index>(arr: T[], cb?: IndexCb<T, U>) {
    const map: Record<Index, boolean> = {};

    if (!cb) {
        arr.forEach((key) => (map[key as any] = true));
    }
    else {
        arr.forEach((key, i) => (map[cb(key, i)] = true));
    }

    return map;
}

/** 在`rest`数组中，且不在`arr`数组中的 */
export function exclude<T extends Index>(arr: T[], rest: T[]): T[];
export function exclude<T extends object, U extends Index>(arr: T[], rest: T[], cb: IndexCb<T, U>): T[];
export function exclude<T, U extends Index>(arr: T[], rest: T[], cb?: IndexCb<T, U>) {
    if (cb) {
        const map = toBoolMap(arr, cb);
        return rest.filter((item, index) => !map[cb(item, index)]);
    }
    else {
        const map = toBoolMap(arr as any[]);
        return rest.filter((key) => !map[key]);
    }
}
