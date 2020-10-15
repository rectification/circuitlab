import { isNumber } from 'src/utils/assert';

/** 多对一的数据映射 */
export default class HashMap {
    /** hash 表数据 */
    private _map: AnyObject<number> = {};

    /** 当前含有的值的数量 */
    get max() {
        return Math.max(-1, ...Object.values(this._map)) + 1;
    }

    /** 获取某个键值 */
    get(key: string) {
        return this._map[key];
    }

    /** 设置一个键值对 */
    set(key: string, value = this.max) {
        this._map[key] = value;
    }

    /** 是否含有某个键值 */
    has(key: string) {
        return isNumber(this._map[key]);
    }

    /** 删除某个键 */
    delete(key: string) {
        return Reflect.deleteProperty(this._map, key);
    }

    /** 删除某个值的所有键 */
    deleteValue(value: number) {
        const { _map: map } = this;

        for (const key of  Object.keys(map)) {
            if (map[key] === value) {
                this.delete(key);
            }
            else if (map[key] > value) {
                map[key]--;
            }
        }
    }

    /** 变更某个值 */
    changeValue(oldVal: number, newVal: number) {
        const { _map: map } = this;
        const oldKeys: string[] = [];

        for (const key of Object.keys(map)) {
            // 标号比参考节点大的减 1
            if (map[key] > oldVal) {
                map[key] -= 1;
            }
            // 旧节点保存
            else if (map[key] === oldVal) {
                oldKeys.push(key);
            }
        }

        // 旧节点赋值为新的
        oldKeys.forEach((key) => (map[key] = newVal));
    }
}
