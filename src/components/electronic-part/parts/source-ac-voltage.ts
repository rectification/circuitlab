import { ElectronicPrototype, PartType, UnitType  } from './constant';
import { numberParser } from 'src/lib/number';

const part: ElectronicPrototype = {
    pre: 'V',
    type: PartType.AcVoltageSource,
    introduction: '交流电压源',
    txtLBias: 24,
    padding: [1, 1, 1, 1],
    margin: [1, 0, 1, 0],
    params: [
        {
            label: '峰值电压',
            unit: UnitType.Volt,
            default: '220',
            vision: true,
        },
        {
            label: '频率',
            unit: UnitType.Hertz,
            default: '50',
            vision: true,
        },
        {
            label: '偏置电压',
            unit: UnitType.Volt,
            default: '0',
            vision: false,
        },
        {
            label: '初始相角',
            unit: UnitType.Degree,
            default: '0',
            vision: false,
        },
    ],
    points: [
        {
            position: [0, -40],
            direction: [0, -1],
        },
        {
            position: [0, 40],
            direction: [0, 1],
        },
    ],
    shape: [
        {
            name: 'circle',
            attribute: {
                cx: '0', cy: '0', r: '19', class: 'fill-white',
            },
        },
        {
            name: 'path',
            attribute: {
                d: 'M0,-40V-19.5M0,19.5V40M0,-16V-8M-4,-12H4M-4,15H4M-10,0Q-5,-10,0,0M0,0Q5,10,10,0',
            },
        },
        {
            name: 'rect',
            attribute: {
                x: '-20', y: '-30', width: '40', height: '60', class: 'focus-transparent',
            },
        },
    ],
    iterative: {
        markInMatrix({ F, S }, branch, mark) {
            F.set(branch, branch, 1);
            S.set(branch, 0, mark);
        },
        createIterator({ source }, params, mark) {
            /** 峰值电压 */
            const factor = numberParser(params[0]);
            /** 频率 */
            const frequency = numberParser(params[1]);
            /** 偏置电压 */
            const bias = numberParser(params[2]);
            /** 初始相角 */
            const phase = numberParser(params[3]);
            /** 需要更新的数值位置 */
            const position = source.filterPostion(mark);

            return ({ time }) => {
                // 当前输出电压
                const volt = factor * Math.sin(frequency * time * Math.PI * 2 + phase / 180 * Math.PI) + bias;
                // 更新矩阵的值
                position.forEach(([i, j]) => source.set(i, j, volt));
            };
        },
    },
};

export default part;
