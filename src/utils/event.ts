import { supportsOnce, supportsPassive } from './env';

/**
 * 生成一个一次性的事件
 * @param {Element} el
 * @param {string} type
 * @returns {Promise<Event>}
 */
export function onceEvent<T extends Event>(el: Element, type: T['type']): Promise<T> {
    let option: boolean | {
        passive?: boolean;
        once?: boolean;
    };

    if (!supportsPassive && !supportsOnce) {
        option = false;
    }
    else {
        option = {};

        if (supportsPassive) {
            option.passive = true;
        }
        if (supportsOnce) {
            option.once = true;
        }
    }

    return new Promise((resolve) => {
        el.addEventListener(
            type,
            function once(event: Event) {
                resolve(event as T);
                if (!supportsOnce) {
                    el.removeEventListener(type, once);
                }
            },
            option,
        );
    });
}
