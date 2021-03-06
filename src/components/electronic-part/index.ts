import { Component } from 'vue-property-decorator';

import * as Map from 'src/lib/map';
import Point from 'src/lib/point';
import Matrix from 'src/lib/matrix';

import setPartParams from './dialog-controller';
import LineComponent from '../electronic-line';

import { DrawEvent } from '../drawing-main/event-controller';
import { createLineData } from '../electronic-line/helper';
import { isEqual, delay, copyProperties } from 'src/lib/utils';
import { MutationName as Mutation } from 'src/vuex';
import { product, PartShape } from './helper';

import { default as ElectronicPoint, PointClassName } from '../electronic-point';
import { default as Electronics, ElectronicPrototype, PartType } from './parts';
import { default as ElectronicCore, findPartComponent, findLineComponent } from './common';

type TextPlacement = 'center' | 'top' | 'right' | 'bottom' | 'left';
type dispatchKey = 'id' | 'type' | 'params' | 'rotate' | 'connect' | 'position';
const disptchKeys: dispatchKey[] = ['id', 'type', 'params', 'rotate', 'connect', 'position'];

export * from './helper';
export * from './parts';
export { default as Electronics } from './parts';

/** 器件基础数据 */
export type PartData = Pick<PartComponent, dispatchKey>;

export interface PartPointAttr {
    size: number;
    originPosition: Point;
    position: Point;
    direction: Point;
    class: PointClassName;
}

@Component({
    components: {
        ElectronicPoint, PartShape,
    },
})
export default class PartComponent extends ElectronicCore {
    /** 器件类型 */
    readonly type!: keyof Electronics;
    /** 当前器件数据原型 */
    readonly origin!: ElectronicPrototype;

    /** 器件当前旋转矩阵 */
    rotate = new Matrix(2, 'E');
    /** 器件当前位置 */
    position = new Point(1e6, 1e6);
    /** 器件的内部参数 */
    params: string[] = [];
    /** 器件管教连接 */
    connect: string[] = [];

    /** 引脚大小 */
    pointSize: number[] = [];
    /** 说明文本位置 */
    textPosition = new Point(0, 0);
    /** 说明文本方向 */
    textPlacement: TextPlacement = 'bottom';

    /** 是否完成创建 标志位 */
    private isCreated = false;

    /** 初始化 */
    created() {
        const origin = Electronics[this.type];
        const pointLen = origin.points.length;

        this.pointSize = Array(pointLen).fill(-1);

        if (this.connect.length === 0) {
            this.connect = Array(pointLen).fill('');
        }

        if (this.params.length === 0) {
            this.params = origin.params.map((n) => n.default);
        }

        Object.defineProperty(this, 'origin', {
            enumerable: true,
            writable: false,
            configurable: true,
            value: origin,
        });

        this.renderText();
    }

    /** 是否显示文本 */
    get showText() {
        return this.type !== PartType.ReferenceGround;
    }
    /** 当前旋转矩阵的逆矩阵 */
    get invRotate() {
        return this.rotate.inverse();
    }
    /** 当前器件可以显示的文本 */
    get texts() {
        return this.params
            .map((v, i) => ({ value: v, ...this.origin.params[i] }))
            .filter((txt) => txt.vision)
            .map((txt) => (txt.value + txt.unit).replace(/u/g, 'μ'));
    }
    /** 当前引脚状态 */
    get points(): PartPointAttr[] {
        return this.origin.points.map((point, i) => ({
            size: this.pointSize[i],
            originPosition: Point.from(point.position),
            position: product(point.position, this.rotate),
            direction: product(point.direction, this.rotate),
            class: (this.connect[i] ? 'part-point-close' : 'part-point-open') as PointClassName,
        }));
    }
    /** 当前器件范围 */
    get margin() {
        const types = ['margin', 'padding'];
        const outter = [[0, 0], [0, 0]];
        const box = {
            margin: [[0, 0], [0, 0]],
            padding: [[0, 0], [0, 0]],
        };

        for (let i = 0; i < 2; i++) {
            const type = types[i] as 'margin' | 'padding';
            const boxSize = Electronics[this.type][type];
            const endpoint = [[-boxSize[3], -boxSize[0]], [boxSize[1], boxSize[2]]];
            const data = endpoint.map((point) => product(point, this.rotate));

            box[type] = [
                [
                    Math.min(data[0][0], data[1][0]),
                    Math.min(data[0][1], data[1][1]),
                ],
                [
                    Math.max(data[0][0], data[1][0]),
                    Math.max(data[0][1], data[1][1]),
                ],
            ];
        }

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                outter[i][j] = box.margin[i][j] + box.padding[i][j];
            }
        }

        return {
            outter,
            inner: box.padding,
        };
    }
    /** 当前器件显示样式 */
    get style(): Partial<CSSStyleDeclaration> {
        return this.isCreated ? { opacity: '1' } : {};
    }

    /** 在图纸标记当前器件 */
    markSign() {
        const inner = this.margin.inner;
        const position = this.position.floorToSmall();

        // 器件内边距占位
        position.everyRect(inner, (node) => {
            Map.setPoint({
                id: this.id,
                point: Point.from(node),
                type: Map.NodeType.Part,
            });

            return true;
        });

        // 器件管脚距占位
        this.points.forEach((point, i) => Map.setPoint({
            point: point.position.floorToSmall().add(position),
            type: Map.NodeType.PartPoint,
            id: `${this.id}-${i}`,
        }));
    }
    /** 删除当前器件在图纸中的标记 */
    deleteSign() {
        const inner = this.margin.inner;
        const position = this.position.floorToSmall();

        // 删除器件内边距占位
        position.everyRect(inner, (node) => Map.deletePoint(node));
        // 删除器件引脚占位
        this.points.forEach((point) => Map.deletePoint(point.position.floorToSmall().add(position)));
    }

    /** 将当前器件数据更新至`vuex` */
    dispatch() {
        this.$store.commit(
            Mutation.UPDATE_PART,
            copyProperties(this, disptchKeys),
        );
    }
    /** 当前位置是否被占用 */
    isCover(location = this.position) {
        const coverHash = {}, margin = this.margin;

        let label = false;
        const position = Point.from(location).floorToSmall();

        // 检查器件管脚，管脚点不允许存在任何元素
        for (const point of this.points) {
            const node = position.add(point.position.floorToSmall());
            if (Map.hasPoint(node)) {
                return (true);
            }
            coverHash[node.join(',')] = true;
        }

        // 扫描内边距，内边距中不允许存在任何元素
        position.everyRect(margin.inner, (node) => {
            if (Map.hasPoint(node)) {
                label = true;
                return false;
            }
            else {
                coverHash[node.join(',')] = true;
                return true;
            }
        });

        if (label) {
            return (true);
        }

        // 扫描外边距
        position.everyRect(margin.outter, (node) => {
            // 跳过内边距
            if (coverHash[node.join(',')]) {
                return true;
            }
            // 外边框为空
            if (!Map.hasPoint(node)) {
                return true;
            }
            // 外边框不是由器件占据
            const status = Map.getPoint(node);
            if (!status || status.type !== Map.NodeType.Part) {
                return true;
            }

            // 校验相互距离
            const part = findPartComponent(status.id);
            const another = part.margin.outter;
            const distance = position.add(part.position.floorToSmall(), -1);

            // 分别校验 x、y 轴
            for (let i = 0; i < 2; i++) {
                if (distance[i] !== 0) {
                    const sub = distance[i] > 0 ? 0 : 1;
                    const diffX = Math.abs(distance[i]);
                    const limitX = Math.abs(margin.outter[sub][i]) + Math.abs(another[1 - sub][i]);

                    if (diffX < limitX) {
                        label = true;
                        return false;
                    }
                }
            }

            return true;
        });

        return (label);
    }
    /** 渲染说明文本 */
    renderText() {
        // TODO: 缺正中央
        const textHeight = 11,
            spaceHeight = 5,
            len = this.texts.length,
            local = this.origin.txtLBias,
            pend = this.textPosition,
            points = this.points.map((p) => p.direction),
            direction = [[0, 1], [0, -1], [1, 0], [-1, 0]]
                .filter((di) => points.every((point) => !point.isEqual(di)))
                .map((di) => Point.from(di).mul(local))
                .reduce(
                    (pre, next) =>
                        pre.distance(pend) < next.distance(pend) ? pre : next,
                );

        if (direction[0]) {
            pend[1] = ((1 - len) * textHeight - len * spaceHeight) / 2;

            if (direction[0] > 0) {
                pend[0] = local;
                this.textPlacement = 'right';
            }
            else {
                pend[0] = -local;
                this.textPlacement = 'left';
            }
        }
        else {
            pend[0] = 0;

            if (direction[1] > 0) {
                this.textPlacement = 'bottom';
                pend[1] = textHeight + local;
            }
            else {
                this.textPlacement = 'top';
                pend[1] = -((textHeight + spaceHeight) * len + local);
            }
        }
    }
    /** 移动说明文本 */
    moveText() {
        this.setSelectDevices([this.id]);

        this
            .createDrawEvent()
            .setCursor('move_part')
            .setHandlerEvent((e: DrawEvent) => (this.textPosition = this.textPosition.add(e.$movement)))
            .setStopEvent({ type: 'mouseup', which: 'left' })
            .start().then(() => this.renderText());
    }

    // 事件接口
    /** 设置属性 */
    async setParams() {
        this.setSelectDevices([this.id]);

        const params = await setPartParams(
            this.type,
            this.id,
            this.position
                .mul(this.mapStatus.zoom)
                .add(this.mapStatus.position),
            this.params,
        );

        // 参数更新
        if (
            this.id !== params.id ||
            !isEqual(this.params, params.params)
        ) {
            this.update(params);
        }
    }
    /** 设置新器件设置事件 */
    async setCreateEvent() {
        this.setSelectDevices([this.id]);
        this.renderText();

        await this
            .createDrawEvent()
            .setCursor('move_part')
            .setStopEvent({ type: 'mousedown', which: 'left' })
            .setHandlerEvent((e: DrawEvent) => { this.position = e.$position; })
            .start();

        const node = this.position;

        this.position = Point.from(
            node.round(20)
                .around((point) => !this.isCover(point), 20)
                .reduce(
                    (pre, next) =>
                        node.distance(pre) < node.distance(next) ? pre : next,
                ),
        );

        // 数据更新
        this.dispatch();
        this.markSign();

        // 完成创建标志位
        delay(6).then(() => (this.isCreated = true));
    }
    /** 开始绘制导线 */
    async setDrawLine(i: number) {
        // 当前引脚坐标
        const node = this.position.add(this.points[i].position);

        let line: LineComponent;

        // 该引脚已有连接
        if (this.connect[i]) {
            line = findLineComponent(this.connect[i]);
            const mark = line.findConnectIndex(node);

            if (mark === 0) {
                line.reverse();
            }

            // 取消当前两者连接
            this.connect.$set(i, '');
            line.connect.$set(mark, '');
        }
        // 该引脚为空
        else {
            const data = createLineData();
            this.$store.commit(Mutation.PUSH_LINE, data);
            await this.$nextTick();

            line = findLineComponent(data.id);

            // 设置当前两者连接
            this.connect.$set(i, line.id);
            line.connect.$set(0, `${this.id}-${i}`);

            // 新导线起点为当前节点
            line.way.splice(0, line.way.length, Point.from(node), Point.from(node));
        }

        // 设置高亮
        this.setSelectDevices([this.id]);

        line.toBottom();
        line.drawing(1);
    }
    /** 开始移动 */
    clickHandler() {
        if (this.isCreated) {
            this.$emit('select');
        }
    }
    /** 移动当前器件 */
    moveSelf(bais: Point) {
        this.position = this.position.add(bais);
    }
}
