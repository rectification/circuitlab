// import store from 'src/vuex';
import BigNumber from 'bignumber.js';
import HashMap from './hashmap';

import * as Mark from './mark';

import { Matrix } from 'src/lib/matrix';
import { isDef } from 'src/utils/assert';
import { numberParser } from 'src/lib/number';
// import { LineData, LineType } from 'src/components/electronic-line';

// import {
//     PartData,
//     PartRunData,
//     Electronics,
//     PartType,
//     IterativeEquation,
//     IteratorData,
// } from 'src/components/electronic-part';

// type ProgressHandler = (progress: number) => any | Promise<any>;
// type IteratorCreator = IteratorData['createIterator'];
// type UpdateWarpper = (solver: Parameters<IteratorCreator>[0]) => ReturnType<IteratorCreator>;

/** 观测器 */
export interface Observer {
    /** 观测器编号 */
    id: string;
    /** 观测矩阵 */
    matrix: Matrix;
    /** 输出数据 */
    data: number[];
}

/** 求解器 */
export default class Solver {
    // /** 器件数据 */
    // private parts: PartData[] = [];
    // /** 导线数据 */
    // private lines: LineData[] = [];
    // /** 事件函数 */
    // private events: ProgressHandler[] = [];

    // /**
    //  * 处理之后的所有器件合集
    //  *  - 没有辅助器件
    //  *  - 没有可以继续拆分的器件
    //  */
    // private partsAll: PartRunData[] = [];
    // /**
    //  * 器件标记
    //  *  - 包含所有器件（拆分的和未拆分的）
    //  */
    // private partMarks = new HashMap();

    // /** 系数矩阵 */
    // private factor!: Matrix;
    // /** 电源列向量 */
    // private source!: Matrix;
    // /** 迭代方程包装器堆栈 */
    // private updateWarppers: UpdateWarpper[] = [];
    // /** 电流观测器 */
    // private observeCurrent: Observer[] = [];
    // /** 电压观测器 */
    // private observeVoltage: Observer[] = [];

    // /** [管脚->节点号] 对应表 */
    // private PinNodeMap = new HashMap();
    // /**
    //  * [管脚->支路号] 对应表
    //  *  - 在拆分器件之前，可能会有拥有三个或以上管脚的器件，经过拆分之后就没有这种器件存在的
    //  */
    // private PinBranchMap = new HashMap();

    // constructor(parts: PartData[], lines: LineData[]) {
    //     // 内部储存初始化
    //     this.parts = parts;
    //     this.lines = lines;

    //     // 状态初始化
    //     // 注：不可以调整以下函数的调用顺序
    //     this.setPinBranchMap();
    //     this.setPinNodeMap();
    //     this.splitParts();
    //     this.handleAttach();
    //     this.observeMeter();
    //     this.setCircuitMatrix();
    // }

    // /** 用 id 搜索器件或导线 */
    // private findPart(id: string) {
    //     let result: PartData | LineData | undefined;

    //     if (/^line_/.test(id)) {
    //         result = this.lines.find((line) => line.id === id);
    //     }
    //     else {
    //         const [partId] = id.split('-');
    //         result = this.parts.find((part) => part.id === partId);
    //     }

    //     if (!result) {
    //         throw new Error(`未能找到该器件：${id}`);
    //     }

    //     return result;
    // }

    // /** 获取输入导线所在节点的所有导线和连接着的所有引脚 */
    // private getNodeConnectByLine(id: string) {
    //     /** 入口导线 */
    //     const line = this.findPart(id) as LineData;
    //     /** 待访问的导线堆栈 */
    //     const temp = [line];

    //     /** 当前节点的所有导线堆栈 */
    //     const lines: LineData[] = [];
    //     /** 当前节点连接的所有器件引脚 */
    //     const partPins: string[] = [];

    //     // 搜索节点
    //     while (temp.length > 0) {
    //         const current = temp.pop()!;
    //         const connections = current.connect.join(' ').split(' ');

    //         // 记录当前导线
    //         lines.push(current);

    //         // 循环迭代当前导线所有的连接
    //         for (const pin of connections) {
    //             const item = this.findPart(pin);

    //             // 导线
    //             if (item.type === LineType.Line) {
    //                 if (
    //                     !temp.find((li) => li.id === item.id) &&
    //                     !lines.find((li) => li.id === item.id)
    //                 ) {
    //                     temp.push(item);
    //                 }
    //             }
    //             // 器件引脚
    //             else {
    //                 partPins.push(pin);
    //             }
    //         }
    //     }

    //     return { lines, partPins };
    // }

    // /** 由支路器件到支路电流计算矩阵 */
    // private getCurrentMatrixByBranch(branch: string) {
    //     const { PinBranchMap } = this;

    //     /** 电流矩阵 */
    //     const matrix = new Matrix(1, PinBranchMap.max, 0);
    //     /** 支路器件 */
    //     const part = this.findPart(branch);

    //     // 电流表
    //     // 因为电流表在电路中实际体现出来是短路（引脚节点是同一个编号），所以必须从导线搜索原始连接
    //     if (isDef(part) && part.type === PartType.CurrentMeter) {
    //         // 搜索电流表出口所连的所有器件
    //         const { partPins } = this.getNodeConnectByLine(part.connect[1]);
    //         // 解析为器件（支路）编号，并排除掉其本身以及无效支路
    //         const branchs = partPins.map((pin) => pin.split('-')[0]).filter(
    //             (branchName) =>
    //                 branchName !== part.id &&
    //                 PinBranchMap.has(branchName),
    //         );

    //         branchs.forEach((branchName) => matrix.set(0, PinBranchMap.get(branchName), 1));
    //     }
    //     // 非电流表器件
    //     // 直接取支路电流即可
    //     else {
    //         matrix.set(0, PinBranchMap.get(branch), 1);
    //     }

    //     return matrix;
    // }

    // /** 由管脚到节点电压计算矩阵 */
    // private getVoltageMatrixByPin(pin: string) {
    //     const { PinNodeMap } = this;

    //     /** 电压矩阵 */
    //     const matrix = new Matrix(1, PinNodeMap.max, 0);
    //     /** 实际的器件管教 */
    //     let realPin = pin;

    //     // 未找到节点记录
    //     if (!PinNodeMap.has(pin)) {
    //         /** 引脚编号拆分 */
    //         const [partId, pinMark] = pin.split('-');
    //         /** 引脚器件 */
    //         const part = this.findPart(pin) as PartData;
    //         /** 器件拆分原型 */
    //         const { apart } = Electronics[part.type];

    //         // 器件不可拆分，则抛出错误
    //         if (!apart) {
    //             throw new Error(`(Solver) 非法器件: ${partId}`);
    //         }

    //         realPin = `${partId}_${apart.interface[pinMark][0]}`;
    //     }

    //     matrix.set(0, PinNodeMap.get(realPin), 1);
    //     return matrix;
    // }

    // /** 扫描所有导线，生成 [管脚->节点号] 对应表 */
    // private setPinNodeMap() {
    //     /** 导线 hash 表 */
    //     const lineHash: AnyObject<boolean> = {};

    //     // 搜索所有导线
    //     for (const line of this.lines) {
    //         // 当前导线已经访问过了
    //         if (lineHash[line.id]) {
    //             continue;
    //         }

    //         // 当前节点的所有导线和引脚
    //         const { lines, partPins } = this.getNodeConnectByLine(line.id);
    //         // 当前节点最大值
    //         const nodeNumber = this.PinNodeMap.max;

    //         // 记录当前导线
    //         lines.forEach(({ id }) => (lineHash[id] = true));
    //         // 记录所有引脚连接节点的编号
    //         partPins.forEach((pin) => this.PinNodeMap.set(pin, nodeNumber));
    //     }
    // }

    // /** 扫描所有器件，生成 [器件->支路号] 对应表 */
    // private setPinBranchMap() {
    //     const { PinBranchMap } = this;

    //     for (const part of this.parts) {
    //         // 辅助器件，不建立支路
    //         if (
    //             part.type === PartType.CurrentMeter ||
    //             part.type === PartType.VoltageMeter ||
    //             part.type === PartType.ReferenceGround
    //         ) {
    //             continue;
    //         }

    //         // 一器件一支路
    //         PinBranchMap.set(part.id);
    //     }
    // }

    // /** 拆分所有能拆分的器件 */
    // private splitParts() {
    //     for (const part of this.parts) {
    //         // 跳过辅助器件
    //         if (
    //             part.type === PartType.ReferenceGround ||
    //             part.type === PartType.CurrentMeter ||
    //             part.type === PartType.VoltageMeter
    //         ) {
    //             continue;
    //         }

    //         // 器件原型
    //         const { apart } = Electronics[part.type];
    //         // 取出 HashMap
    //         const { PinNodeMap, PinBranchMap, partMarks } = this;

    //         // 标记当前器件
    //         partMarks.set(part.id);

    //         // 跳过不需要拆分的器件
    //         if (!apart) {
    //             this.partsAll.push(part);
    //             continue;
    //         }

    //         const {
    //             interface: external,
    //             connect: internal,
    //             parts: insideParts,
    //         } = apart;

    //         /** 由外部到内部的编号连接银映射 */
    //         const concatInside = (a: string, b: string) => `${a}_${b}`;

    //         // 对外管脚号转换为内部标号
    //         for (let i = 0; i < external.length; i++) {
    //             const outsidePin = `${part.id}-${i}`;
    //             const mark = PinNodeMap.get(outsidePin);

    //             PinNodeMap.delete(outsidePin);

    //             for (const pin of external[i]) {
    //                 PinNodeMap.set(concatInside(part.id, pin), mark);
    //             }
    //         }

    //         // 根据器件内部结构追加 PinNodeMap
    //         for (const node of internal) {
    //             const mark = PinNodeMap.max;

    //             for (const pin of node) {
    //                 PinNodeMap.set(concatInside(part.id, pin), mark);
    //             }
    //         }

    //         // 根据器件内部结构追加 PinBranchMap
    //         for (const insidePart of insideParts) {
    //             // 新器件编号s
    //             const newId = concatInside(part.id, insidePart.id);

    //             // 新器件入栈
    //             this.partsAll.push({
    //                 id: newId,
    //                 type: insidePart.type,
    //                 // 拆分器件的标记值是原器件的标记值
    //                 params: insidePart.params(part, Mark.getMark(partMarks.get(part.id))),
    //             });

    //             // 标记当前器件
    //             partMarks.set(newId);
    //             PinBranchMap.set(newId);
    //         }

    //         // 支路对应表中删除原器件
    //         PinBranchMap.deleteValue(PinBranchMap.get(part.id));
    //     }
    // }

    // /**
    //  * 处理辅助器件
    //  *  - 参考地，参考地所在节点全部标号为 -1
    //  *  - 电流表，合并电流表入口，删除节点表中记录
    //  *  - 电压表，不做处理（因为电压表相当于开路）
    //  */
    // private handleAttach() {
    //     for (const part of this.parts) {
    //         // 参考地
    //         if (part.type === PartType.ReferenceGround) {
    //             const { PinNodeMap } = this;
    //             const GroundPin = `${part.id}-0`;

    //             PinNodeMap.changeValue(PinNodeMap.get(GroundPin), -1);
    //             PinNodeMap.delete(GroundPin);
    //         }
    //         // 电流表
    //         else if (part.type === PartType.CurrentMeter) {
    //             const { PinNodeMap } = this;

    //             // 电流表两端节点编号
    //             const meterInput = `${part.id}-0`;
    //             const meterOutput = `${part.id}-1`;
    //             const nodeMin = Math.min(PinNodeMap.get(meterInput), PinNodeMap.get(meterOutput));
    //             const nodeMax = Math.max(PinNodeMap.get(meterInput), PinNodeMap.get(meterOutput));

    //             // 合并电流表两端节点（删除大的）
    //             PinNodeMap.changeValue(nodeMax, nodeMin);

    //             // 节点对应表中删除记录
    //             PinNodeMap.delete(meterInput);
    //             PinNodeMap.delete(meterOutput);
    //         }
    //     }
    // }

    // /** 创建观测矩阵 */
    // private observeMeter() {
    //     for (const meter of this.parts) {
    //         // 电流表
    //         if (meter.type === PartType.CurrentMeter) {
    //             this.observeCurrent.push({
    //                 id: meter.id,
    //                 data: [],
    //                 matrix: this.getCurrentMatrixByBranch(meter.id),
    //             });
    //         }
    //         // 电压表
    //         else if (meter.type === PartType.VoltageMeter) {
    //             const negativeVoltage = this.getVoltageMatrixByPin(`${meter.id}-0`);
    //             const positiveVoltage = this.getVoltageMatrixByPin(`${meter.id}-1`);

    //             // 正电极减去负电极，即为测量电压
    //             const matrix = positiveVoltage.add(negativeVoltage.factor(-1));

    //             this.observeVoltage.push({
    //                 id: meter.id,
    //                 data: [],
    //                 matrix,
    //             });
    //         }
    //     }
    // }

    // /** 创建电路系数矩阵 */
    // private setCircuitMatrix() {
    //     // 常量展开
    //     const { PinNodeMap, PinBranchMap, partMarks } = this;
    //     const nodeNumber = PinNodeMap.max;
    //     const branchNumber = PinBranchMap.max;

    //     /**
    //      * 关联矩阵
    //      *  - 一条支路连接于两个节点，则称该支路与这两个结点相关联
    //      *  - `A[j, k] = + 1`表示支路`k`与节点`j`关联，并且它的方向背离结点
    //      *  - `A[j, k] = - 1`表示支路`k`与节点`j`关联，并且它指向结点
    //      *  - `A[j, k] = 0`表示支路`k`与节点`j`无关联
    //      */
    //     const A = new Matrix(nodeNumber, branchNumber, 0);
    //     /** 导纳描述的电导电容矩阵 */
    //     const F = new Matrix(branchNumber);
    //     /** 阻抗描述的电阻电感矩阵 */
    //     const H = new Matrix(branchNumber);
    //     /** 独立电压电流源列向量 */
    //     const S = new Matrix(branchNumber, 1, 0);
    //     /** 迭代方程生成器的矩阵数据 */
    //     const updateMatrix = { A, F, H, S };

    //     // 扫描所有器件，建立关联矩阵
    //     for (const part of this.partsAll) {
    //         for (let i = 0; i < 2; i++) {
    //             const node =  PinNodeMap.get(`${part.id}-${i}`);
    //             const branch = PinBranchMap.get(part.id);

    //             // 跳过参考节点
    //             if (node === -1) {
    //                 continue;
    //             }

    //             /**
    //              * 此处划定的正方向统一为从引脚 0 指向引脚 1
    //              * 则引脚 0 的关联矩阵值为 1，引脚 1 的关联矩阵值为 -1
    //              */
    //             A.set(node, branch, Math.pow(-1, i));
    //         }
    //     }

    //     // 建立器件矩阵
    //     // 还未拆分并且有迭代方程的器件
    //     for (const part of this.parts) {
    //         const { apart, iterative } = Electronics[part.type];

    //         // 跳过无法拆分或者没有迭代方程的器件
    //         if (!apart || !iterative) {
    //             continue;
    //         }

    //         const mark = Mark.getMark(partMarks.get(part.id));

    //         // 此时标记的支路编号是无效的
    //         if (iterative.markInMatrix) {
    //             iterative.markInMatrix(updateMatrix, mark, -1);
    //         }

    //         this.updateWarppers.push((solver) => iterative.createIterator(solver, part, mark));
    //     }

    //     // 拆分后的所有器件
    //     for (const part of this.partsAll) {
    //         /** 当前器件所在支路 */
    //         const branch = this.PinBranchMap.get(part.id);
    //         /** 当前的器件参数生成器 */
    //         const { constant, iterative } = Electronics[part.type];

    //         // 都不存在则报错
    //         if (!constant && !iterative) {
    //             throw new Error('该器件不存在 参数/常量 生成器');
    //         }
    //         // 常量参数
    //         else if (constant) {
    //             constant(updateMatrix, part.params, branch);
    //         }
    //         // 标记迭代参数
    //         else if (iterative) {
    //             const mark = Mark.getMark(this.partMarks.get(part.id));

    //             if (iterative.markInMatrix) {
    //                 iterative.markInMatrix(updateMatrix, mark, branch);
    //             }

    //             this.updateWarppers.push(
    //                 (solver) =>
    //                     iterative.createIterator(solver, part, mark),
    //             );
    //         }
    //     }

    //     // 系数矩阵
    //     this.factor = Matrix.merge([
    //         [0,              0,     A],
    //         [A.transpose(), 'E',    0],
    //         [0,              F,     H],
    //     ]);

    //     // 电源列向量
    //     this.source = (
    //         new Matrix(A.row, 1, 0)
    //             .concatDown(new Matrix(A.column, 1, 0), S)
    //     );
    // }

    // /** 设置进度条事件 */
    // onProgress(event: ProgressHandler) {
    //     this.events.push(event);
    // }

    // /** 开始求解 */
    // async startSolve() {
    //     // 终止和步长时间
    //     const { state: { time }} = store;
    //     const end = numberParser(time.end);
    //     const step = numberParser(time.step);

    //     /** 电路常量属性展开 */
    //     const {
    //         events,
    //         factor,
    //         source,
    //         observeVoltage,
    //         observeCurrent,
    //         PinNodeMap: {
    //             max: nodeNumber,
    //         },
    //         PinBranchMap: {
    //             max: branchNumber,
    //         },
    //     } = this;

    //     /** 结点电压列向量 */
    //     let nodeVoltage = new Matrix(nodeNumber, 1, 0);
    //     /** 支路电流列向量 */
    //     let branchCurrent = new Matrix(branchNumber, 1, 0);
    //     /** 当前模拟器的精确时间 */
    //     let current = new BigNumber(0);
    //     /** 当前模拟器的精确时间的缓存 */
    //     let currentCache = 0;
    //     /** 系数方程是否被更改 */
    //     let factorChange = false;
    //     /** 系数逆矩阵 */
    //     let factorInverse!: Matrix;

    //     /** 时间坐标数组 */
    //     const times = [currentCache];
    //     /** 系数矩阵代理 */
    //     const factorProxy = new Proxy(factor, {
    //         get(target, property) {
    //             // 代理 set 方法
    //             if (property === 'set') {
    //                 return (...args: Parameters<Matrix['set']>) => {
    //                     factorChange = true;
    //                     target.set(...args);
    //                 };
    //             }
    //             else {
    //                 return target[property];
    //             }
    //         },
    //     });
    //     /** 迭代方程堆栈 */
    //     const updates = this.updateWarppers.map((func) => func({
    //         Factor: factorProxy,
    //         Source: this.source,
    //         getVoltageMatrixByPin: this.getVoltageMatrixByPin.bind(this),
    //         getCurrentMatrixByBranch: this.getCurrentMatrixByBranch.bind(this),
    //     }));
    //     /** 参数迭代方程包装 */
    //     const update: IterativeEquation = (arg) => updates.forEach((cb) => cb(arg));

    //     // 迭代求解
    //     while (currentCache <= end) {
    //         // 标志位初始化
    //         factorChange = false;

    //         // 器件迭代
    //         update({
    //             Voltage: nodeVoltage,
    //             Current: branchCurrent,
    //             time: currentCache,
    //             interval: step,
    //         });

    //         // 若系数矩阵改变，就需要重新求逆
    //         if (!factorInverse || factorChange) {
    //             factorInverse = factor.inverse();
    //         }

    //         // 求解电路
    //         const result = factorInverse.mul(source);

    //         // 更新列向量
    //         nodeVoltage = result.slice([0, 0], [nodeNumber - 1, 0]);
    //         branchCurrent = result.slice([nodeNumber + branchNumber, 0], [result.row - 1, 0]);

    //         // 记录观测电压值
    //         for (const ob of observeVoltage) {
    //             ob.data.push(ob.matrix.mul(nodeVoltage).get(0, 0));
    //         }

    //         // 记录观测电流值
    //         for (const ob of observeCurrent) {
    //             ob.data.push(ob.matrix.mul(branchCurrent).get(0, 0));
    //         }

    //         // 更新当前时间
    //         current = current.plus(step);
    //         currentCache = current.toNumber();

    //         // 时间坐标增加
    //         times.push(currentCache);

    //         // 当前进度
    //         const progress = Math.round(currentCache / end * 100);

    //         // 运行进度事件回调
    //         for (const ev of events) {
    //             await ev(progress);
    //         }
    //     }

    //     // 最后的时间元素无效
    //     times.pop();

    //     return {
    //         times,
    //         meters: this.observeVoltage
    //             .concat(this.observeCurrent)
    //             .map(({ id, data }) => ({ id, data })),
    //     };
    // }
}
