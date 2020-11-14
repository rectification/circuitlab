import { join } from 'path';
import { Writable } from 'stream';
import { spawn } from 'child_process';

/** 当前版本号 */
export  { version } from '../package.json';

/**
 * Generate tag of build
 * @returns {string}
 */
function buildTag() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().slice(0, 8);

    return `${year}.${month}.${date} - ${time}`;
}

/** 当前编译标签 */
export const build = buildTag();

/**
 * 定位到项目根目录
 * @param {string} dir 路径
 */
export const resolve = (...dir: string[]) => join(__dirname, '..', ...dir);

/** 缓存类 */
class CacheStream extends Writable {
    /** 缓存 */
    private _cache: Buffer[] = [];

    /** 消费者逻辑 */
    _write(chunk: Buffer | string, enc: BufferEncoding, callback: () => void) {
        const buf = chunk instanceof Buffer ? chunk : Buffer.from(chunk, enc);

        this._cache.push(buf);

        callback();
    }

    /** 取出缓存 */
    getCache() {
        return Buffer.concat(this._cache).toString('utf8').trim();
    }

    /** 销毁自身 */
    destroy() {
        this._cache.length = 0;
        this._destroy(null, () => {});
    }
}

/** 运行子进程指令 */
export function runSpawn(command: string, ...args: string[]) {
    return new Promise<string>((resolve, reject) => {
        const task = spawn(command, args);
        const stdoutCache = new CacheStream();
        const stderrCache = new CacheStream();
        const destroy = () => {
            stdoutCache.destroy();
            stderrCache.destroy();
        };

        task.stdout!.pipe(stdoutCache);
        task.stderr!.pipe(stderrCache);

        task.on('close', () => {
            resolve(stdoutCache.getCache());
            destroy();
        });

        task.on('error', (code) => {
            reject({ code, error: new Error(stderrCache.getCache()) });
            destroy();
        });
    });
}
