// 浏览器环境判断
export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE = UA && /msie|trident/.test(UA);
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
export const isEdge = UA && UA.indexOf('edge/') > 0;
export const isAndroid = UA && UA.indexOf('android') > 0;
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

export let supportsPassive = false;
export let supportsOnce = false;

if (inBrowser) {
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get() {
                supportsPassive = true;
            },
        });
        document.body.addEventListener('test', null as any, opts);
    }
    catch (e) {}

    try {
        const opts = Object.defineProperty({}, 'once', {
            get() {
                supportsOnce = true;
            },
        });
        document.body.addEventListener('test', null as any, opts);
    }
    catch (e) {}
}

// 全局禁止右键
document.body.oncontextmenu = null;
document.body.addEventListener('contextmenu', (event) => event.preventDefault(), true);
