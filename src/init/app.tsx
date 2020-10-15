import React from 'react';

import { useEffect } from 'react';
import { getQueryByName, get } from 'src/utils/http';

// 移除 loading 界面
function loaded() {
    const loading = document.getElementById('start-loading')!;

    loading.style.opacity = '0';
    loading.style.transition = 'opacity .5s';
    setTimeout(() => loading.remove(), 500);
    console.log('Schematic Ready.');
}

// 获取原理图信息
async function fetchMap() {
    const map = getQueryByName('map');

    if (map) {
        const data = await get(`/examples/${map}.json`).catch((e) => {
            console.error(e);
            return { data: [] };
        });

        // 加载数据
        // await this.$store.dispatch('IMPORT_DATA', data);
        // await this.$nextTick();
    }
}

export const App = () => {
    // 初始化
    useEffect(() => {
        fetchMap().then(loaded);
    }, []);

    return <div>
        测试
    </div>;
};
