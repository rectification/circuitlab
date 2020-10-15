import { isUndef, isBaseType } from './assert';

/**
 * 由输入对象创建 url 链接参数
 * @param {object} params 参数对象
 * @returns {string}
 */
export function urlParamEncode(params: object) {
    /** 解析参数中的对象 */
    function objEncode(from: object, pre = '') {
        let ans = '';

        for (const key in from) {
            if (from.hasOwnProperty(key)) {
                const val = from[key];

                if (isUndef(val)) {
                    continue;
                }

                // 非顶级属性则需要加上方括号
                const uKey = pre.length > 0 ? `[${key}]` : key;
                // 连接参数
                ans += isBaseType(val)
                    ? `&${pre}${uKey}=${encodeURIComponent(val!.toString())}`
                    : `&${objEncode(val, `${pre}${uKey}`)}`;
            }
        }

        return ans.substring(1);
    }

    const result = objEncode(params);

    return result.length > 0 ? ('?' + result) : '';
}

/** 创建获取 url 参数的函数 */
function createUrlMethod(reg: (str: string) => string) {
    return (name: string) => {
        name = name.replace(/[[\]]/g, '\\$&');

        const regex = new RegExp(reg(name));
        const results = regex.exec(window.location.href);

        if (!results || !results[1]) {
            return '';
        }

        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };
}

/** 获取 url 中的参数 - 问号后面的参数 */
export const getQueryByName = createUrlMethod((name: string) => `[?&]${name}(=([^&#]*)|&|#|$)`);

/** 获取 url 中的参数 - 链接中的参数 */
export const getParameterByName = createUrlMethod((name) => `\\/${name}(\\/([^&# ]+?)(\\/|\\?|$))`);

/** ajax 请求接口 */
function ajax<T>(type: 'GET' | 'POST', url: string, data?: object) {
    return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(type, url);

        if (type === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.send((type === 'POST' && data) ? JSON.stringify(data) : null);

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            }
            else {
                reject(new Error(`Network Error: ${xhr.status}`));
            }
        };
    });
}

/** GET 请求 */
export const get = <T = any>(url: string, params: object = {}) => ajax<T>('GET', `${url}${urlParamEncode(params)}`);

/** POST 请求 */
export const post = <T = any>(url: string, data?: object) => ajax<T>('POST', url, data);

/**
 * 下载文件
 * @param {string} name 下载的文件名字
 * @param {Blob} content 文件数据
 */
export function download(name: string, content: Blob) {
    const element = document.createElement('a');
    const url = URL.createObjectURL(content);

    element.href = url;
    element.download = name;
    element.click();

    URL.revokeObjectURL(url);
}
