/**
 * 生成随机字符串
 * @param {number} [len=16] 字符串长度
 * @returns {string}
 */
export function randomString(len = 16) {
    const start = 48, end = 126;
    const exclude = '\\/[]?{};,<>:|`';

    let codes = '';
    while (codes.length < len) {
        const code = String.fromCharCode(Math.random() * (end - start) + start);

        if (!exclude.includes(code)) {
            codes += code;
        }
    }

    return codes;
}

/**
 * Hyphenate a camelCase string.
 * @param {string} str
 */
export function hyphenate(str: string) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 合并标记
 * @param args 需要合并的标记
 * @return {string}
 */
export function mergeMark(...args: string[]) {
    const map: AnyObject<boolean> = Object.create(null);

    // 标记所有的 tag
    args
        .join(' ')
        .split(' ')
        .filter(Boolean)
        .forEach((item) => (map[item] = true));

    return Object.keys(map).join(' ');
}

/**
 * 从主标记中删除元素
 * @param mark 主要标记
 * @param args 待删除的标记合集
 * @return {string}
 */
export function deleteMark(mark: string, ...args: string[]) {
    return mark.split(' ').filter((id) => !args.includes(id)).join(' ');
}

/**
 * base64 编码转换为 Blob
 * @param {string} base64 base64 源码
 * @return {Blob} 转换后的 blob 数据
 */
export function toBlob(base64: string) {
    const label = 'base64,';
    const source = base64.slice(base64.indexOf(label) + label.length);
    const binary =  window.atob(source);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes.buffer]);
}
