import { CreateElement } from 'vue';
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';

import { $P } from 'src/lib/point';
import * as schMap from 'src/lib/map';
import { clone } from 'src/lib/utils';
import { LineWay, WayMap } from './line-way';

import { LineCore } from './line-core';
import { LineSearch } from './line-search';
import ElectronicPoint from 'src/components/electronic-point';

import { DrawEvent } from 'src/components/drawing-main';
import { DrawingOption } from './types';

@Component({
    components: {
        ElectronicPoint,
    },
})
export default class ElectronicLine extends LineSearch {
    /** 器件原始数据 */
    @Prop({ type: Object, default: () => ({}) })
    private readonly value!: LineCore;

    // created() {
    //     this.init();

    //     // 小于 2 个节点，则为新绘制的导线
    //     if (this.way.length < 2) {
    //         this.drawEvent(0);
    //     }
    //     else {
    //         // debugger;
    //         if (this.way.isEqual([[260, 360], [340, 360]])) {
    //             debugger;
    //         }

    //         this.setConnectByWay();
    //         this.dispatch();
    //         this.markSign();
    //     }
    // }
    // beforeDestroy() {
    //     this.deleteSign();
    //     this.$store.commit('DELETE_LINE', this.id);
    // }

    /** 当前导线是否高亮 */
    get focus(): boolean {
        return this.mapStatus.linesNow.includes(this.id);
    }
    /** 导线的两个节点属性 */
    get points() {
        return Array(2).fill(false).map((u, i) => ({
            position: this.way.get(-i) ? $P(this.way.get(-i)) : $P(0, 0),
            class: {
                'line-point-open': !this.connect[i],
                'line-point-part': this.matchPart.test(this.connect[i]),
                'line-point-cross': this.matchLine.test(this.connect[i]),
            },
        }));
    }
    /** 路径转为 path 字符串 */
    get way2path() {
        return !this.way.length ? ''　: 'M' + this.way.map((n) => n.join(',')).join('L');
    }
    /** 路径转为 rect 坐标 */
    get pathRects() {
        const ans = [], wide = 14;

        for (let i = 0; i < this.way.length - 1; i++) {
            const start = this.way[i], end = this.way[i + 1];
            const left = Math.min(start[0], end[0]);
            const top = Math.min(start[1], end[1]);
            const right = Math.max(start[0], end[0]);
            const bottom = Math.max(start[1], end[1]);

            ans.push({
                x: left - wide / 2,
                y: top - wide / 2,
                height: (left === right) ? bottom - top + wide　: wide,
                width: (left === right) ? wide : right - left + wide,
            });
        }

        return ans;
    }

    /** 器件属性同步 */
    @Watch('value')
    private init() {
        const data = this.value;
        this.way = LineWay.from(data.way);
        this.connect = data.connect.slice();
    }

    // 单点绘制模式
    private drawEvent(index: number) {
        // 绘制期间，导线终点默认最大半径
        this.pointSize.$set(1, 8);
        // 输入为终点则反转
        if (index === 1) {
            this.reverse();
        }

        const mapData = schMap.getPoint(this.way[0], true)!;

        const mark = mapData.id.split('-')[1];
        const connectPart = this.findPartComponent(mapData.id);
        const direction = connectPart.points[mark].direction;

        this.mapStatus.linesNow = [this.id];
        this.connect.$set(0, mapData.id);
        connectPart.connect.$set(+mark, this.id);

        // 临时变量
        // const temp: DrawingOption['temp'] = {
        //     onPart: undefined,
        //     mouseBais: $P(),
        //     wayMap: new WayMap(),
        // };

        // this.setDrawEvent({
        //     cursor: 'draw_line',
        //     stopEvent: { type: 'mouseup', which: 'left' },
        //     afterEvent: () => {
        //         const endRound = this.way.get(-1).round();
        //         const status = schMap.getPoint(endRound, true);

        //         // 起点和终点相等或者只有一个点，则删除当前导线
        //         if (this.way.length < 2 || endRound.isEqual(this.way[0])) {
        //             this.$store.commit('DELETE_LINE', this.id);
        //             return;
        //         }

        //         // 确定终点未被占用
        //         const end = (
        //             endRound
        //                 .around()
        //                 .reduce(
        //                     (pre, next) =>
        //                         end.distance(pre) < end.distance(next) ? pre : next
        //                 )
        //         );

        //         this.update();
        //         // this.markSign();
        //     },
        //     handlers: [
        //         // part mouseenter
        //         {
        //             type: 'mouseenter',
        //             capture: true,
        //             callback: (e: DrawEvent) => {
        //                 const className = e.target.getAttribute('class') || '';
        //                 let part: typeof connectPart;

        //                 if (className.includes('focus-partial')) {
        //                     part = this.findPart(e.target.parentElement!);
        //                 }
        //                 else if (
        //                     className.includes('focus-transparent') &&
        //                     connectPart.$el.contains(e.target)
        //                 ) {
        //                     part = connectPart;
        //                 }
        //                 else {
        //                     return;
        //                 }

        //                 temp.onPart = {
        //                     part,
        //                     status: 'over',
        //                     pointIndex: -1,
        //                 };
        //             },
        //         },
        //         // part mouseleave
        //         {
        //             type: 'mouseleave',
        //             capture: true,
        //             callback: (e: DrawEvent) => {
        //                 const className = e.target.getAttribute('class') || '';

        //                 if (!className.includes('focus-partial')) {
        //                     return;
        //                 }

        //                 if (temp.onPart) {
        //                     temp.onPart.status = 'leave';
        //                 }
        //             },
        //         },
        //         // map mousemove
        //         {
        //             type: 'mousemove',
        //             capture: false,
        //             callback: (e: DrawEvent) => this.drawing({
        //                 direction,
        //                 start: $P(this.way[0]),
        //                 end: e.$position,
        //                 temp: {
        //                     ...temp,
        //                     mouseBais: e.$movement,
        //                 },
        //             }),
        //         },
        //     ],
        // });
    }

    private render(h: CreateElement) {
        return (
            <g
                staticClass='line'
                class={{ focus: this.focus }}>
                <path d={this.way2path}></path>
                {this.pathRects.map((rect, i) =>
                    <rect
                        staticClass='line-rect'
                        key={i + 2} x={rect.x} y={rect.y}
                        height={rect.height} width={rect.width}>
                    </rect>,
                )}
                {this.points.map((point, i) =>
                    <electronic-point
                        data-index={i}
                        key={i} r={this.pointSize[i]}
                        class-list={['line-point', point.class]}
                        transform={`translate(${point.position.join()})`}>
                    </electronic-point>,
                )}
            </g>
        );
    }
}