import Point from './point';

import { isArray, isNumber, isString } from 'src/utils/assert';

type MatrixInput = number[][] | Matrix;

/**
 * 矩阵类
 * @class Matrix
 */
export default class Matrix {
    /**
     * 矩阵的行数
     * @type {number}
     */
    row: number;

    /**
     * 矩阵的列数
     * @type {number}
     */
    column: number;

    /**
     * 矩阵数据
     *  - 一维数组
     *  - 64位 double 类型浮点数
     * @private
     * @type {Float64Array}
     */
    private _view: Float64Array;

    /**
     * Creates an instance of Matrix.
     * @param {number} row
     * @param {(number | 'E')} [column]
     * @param {(number | 'E')} [value=0]
     */
    constructor(order: number, value?: number | 'E');
    constructor(row: number, column: number, value?: number | 'E');
    constructor(row: number, column?: number | 'E', value?: number | 'E') {
        /** 输入一个值 - 零矩阵 */
        if (arguments.length === 1) {
            this.row = row;
            this.column = row;
            this._view = Float64Array.from(Array(row * row).fill(0));
        }
        /**
         * 输入两个值
         *  - 第二个值为填充值
         *  - 若第二个值为 'E' 则为单位矩阵
         */
        else if (arguments.length === 2) {
            this.row = row;
            this.column = row;

            if (column === 'E') {
                // 默认全为 0
                this._view = Float64Array.from(Array(row * row).fill(0));
                // 对角线为 1
                for (let i = 0; i < row; i++) {
                    this.set(i, i, 1);
                }
            }
            else {
                this._view = Float64Array.from(Array(row * row).fill(column));
            }
        }
        /**
         * 输入三个值
         *  - 第三个值为填充值
         *  - 若第三个值为 'E'，则从左上角开始的最大子矩阵对角线为 1
         */
        else {
            this.row = row;
            this.column = column as number;

            if (value === 'E') {
                // 行列数中，较小的那个是最大子矩阵的大小
                const size = this.row < this.column ? this.row : this.column;
                // 默认全为 0
                this._view = Float64Array.from(Array(this.row * this.column).fill(0));
                // 对角线为 1
                for (let i = 0; i < size; i++) {
                    this.set(i, i, 1);
                }
            }
            else {
                this._view = Float64Array.from(Array(this.row * this.column).fill(value));
            }
        }
    }

    static from(matrix: MatrixInput) {
        let result: Matrix;

        // 从数组创建矩阵
        if (isArray(matrix)) {
            const { row, column } = calMatrixSize(matrix);
            const data = matrix.reduce((ans, item) => ans.concat(item), []);

            result = new Matrix(row, column, 0);
            result._view.set(data);
        }
        // 复制矩阵
        else {
            result = new Matrix(matrix.row, matrix.column, 0);
            result._view = Float64Array.from(matrix._view);
        }

        return result;
    }

    /**
     * 矩阵组合
     *
     * @example
     *  [[0,  4,  A],
     *   [B, 'E', 0],
     *   [0,  C,  D]]
     *
     * 将形如上面的矩阵合并成一个矩阵，其中 A、B、C、D 为四个不同的矩阵
     * 在同一行（列）的矩阵必须有相同的行（列）数
     * 纯数字或者是'E'矩阵，不影响行列数，只做填充
     */
    static merge(ma: Array<Array<'E' | number | MatrixInput>>) {
        // 每一行有效矩阵的行数
        const rowNumbers: number[] = [];
        for (let i = 0; i < ma.length; i++) {
            let rowNumber = -1;

            for (let j = 0; j < ma[i].length; j++) {
                const cell = ma[i][j];

                if (isNumber(cell) || isString(cell)) {
                    continue;
                }

                const tempRow = cell instanceof Matrix
                    ? cell.row
                    : calMatrixSize(cell).row;

                if (rowNumber > 0 && (rowNumber !== tempRow)) {
                    throw new Error(`无法组合矩阵，第(${i},${j})元素矩阵行数错误`);
                }

                rowNumber = tempRow;
            }

            if (rowNumber < 0) {
                throw new Error(`无法组合矩阵，第${i}行没有有效矩阵`);
            }

            rowNumbers.push(rowNumber);
        }

        // 每一列有效矩阵的列数
        const colNumbers: number[] = [];
        for (let j = 0; j < ma[0].length; j++) {
            let colNumber = -1;

            for (let i = 0; i < ma.length; i++) {
                const cell = ma[i][j];

                if (isNumber(cell) || isString(cell)) {
                    continue;
                }

                const tempCol = cell instanceof Matrix
                    ? cell.column
                    : calMatrixSize(cell).column;

                if (colNumber > 0 && (colNumber !== tempCol)) {
                    throw new Error(`无法组合矩阵，第(${i},${j})元素矩阵列数错误`);
                }

                colNumber = tempCol;
            }

            if (colNumber < 0) {
                throw new Error(`无法组合矩阵，第${j}列没有有效矩阵`);
            }

            colNumbers.push(colNumber);
        }

        // 串联所有矩阵
        let ColumnMatrix!: Matrix;

        for (let i = 0; i < ma.length; i++) {
            let RowMatrix!: Matrix;

            for (let j = 0; j < ma[i].length; j++) {
                const cell = ma[i][j];
                const temp = (isString(cell) || isNumber(cell))
                    ? new Matrix(rowNumbers[i], colNumbers[j], cell)
                    : Matrix.from(cell);

                if (RowMatrix) {
                    RowMatrix = RowMatrix.concatRight(temp);
                }
                else {
                    RowMatrix = temp;
                }
            }

            if (ColumnMatrix) {
                ColumnMatrix = ColumnMatrix.concatDown(RowMatrix);
            }
            else {
                ColumnMatrix = RowMatrix;
            }
        }

        return ColumnMatrix;
    }

    /**
     * 取出矩阵元素
     * @param {number} i
     * @param {number} j
     * @returns {number}
     */
    get(i: number, j: number) {
        return this._view[i * this.column + j];
    }
    /**
     * 设置矩阵值
     * @param {number} i
     * @param {number} j
     * @param {number} value
     */
    set(i: number, j: number, value: number) {
        this._view[i * this.column + j] = value;
    }
    /**
     * 取出矩阵某一行
     * @param {number} row
     * @returns {number[]}
     */
    getRow(row: number): number[] {
        const index = row < 0 ? this.row + row : row;

        if (index > this.row || index < 0) {
            throw new Error('(matrix) index of row out of bounds.');
        }

        const ans: number[] = [], start = index * this.column;
        for (let i = 0; i < this.column; i++) {
            ans[i] = this._view[start + i];
        }
        return ans;
    }
    /**
     * 取出矩阵某一列
     * @param {number} column
     * @returns {number[]}
     */
    getColumn(column: number): number[] {
        const index = column < 0 ? this.column + column : column;

        if (index > this.column || index < 0) {
            throw new Error('(matrix) index of column out of bounds.');
        }

        const ans: number[] = [];
        for (let i = 0; i < this.row; i++) {
            ans[i] = this._view[index + i * this.column];
        }
        return ans;
    }
    /**
     * 取出矩阵的中间一部分
     * @param a 左上角位置
     * @param b 右下角位置
     */
    slice(a: [number, number] | number[] | Point, b: [number, number] | number[] | Point) {
        // 取出坐标
        const [ax, ay] = a, [bx, by] = b;

        // 输入格式检查
        if (!(
            ax >= 0 && ax < this.row && bx >= 0 && bx < this.row &&
            ay >= 0 && ay < this.column && by >= 0 && by < this.column
        )) {
            throw new Error(`输入位置错误 a: ${a.join()}, b: ${b.join()}`);
        }

        const xMin = Math.min(ax, bx);
        const xMax = Math.max(ax, bx);
        const yMin = Math.min(ay, by);
        const yMax = Math.max(ay, by);

        const result = new Matrix(xMax - xMin + 1, yMax - yMin + 1, 0);

        for (let i = xMin; i <= xMax; i++) {
            for (let j = yMin; j <= yMin; j++) {
                result.set(i - xMin, j - yMin, this.get(i, j));
            }
        }

        return (result);
    }
    /**
     * 字符串连接
     * @param {string} str
     * @returns {string}
     */
    join(str: string = ','): string {
        return this._view.join(str);
    }
    /**
     * 以数组的 json 字符串输出
     * @return {string}
     */
    toArrayContent() {
        const arr: number[][] = [];

        for (let i = 0; i < this.row; i++) {
            arr.push(this.getRow(i));
        }

        const arrStr = arr.map((item) => `  [${item.join(', ')}],`);

        return `[\n${arrStr.join('\n')}\n]`;
    }
    /**
     * 交换 from、to 所在的行
     * @param {number} from
     * @param {number} to
     * @returns {this}
     */
    exchangeRow(from: number, to: number): this {
        if (from !== to) {
            const start = from * this.column;
            const end = to * this.column;

            for (let i = 0; i < this.column; i++) {
                const temp = this._view[start + i];
                this._view[start + i] = this._view[end + i];
                this._view[end + i] = temp;
            }
        }

        return this;
    }
    /**
     * 交换 from、to 所在的列
     * @param {number} from
     * @param {number} to
     * @returns {this}
     */
    exchangeColumn(from: number, to: number): this {
        if (from !== to) {
            for (let i = 0; i < this.row; i++) {
                const nowRow = i * this.column;
                const temp = this._view[nowRow + from];

                this._view[nowRow + from] = this._view[nowRow + to];
                this._view[nowRow + to] = temp;
            }
        }

        return this;
    }
    /**
     * 矩阵转置
     * @returns {Matrix}
     */
    transpose() {
        const result = new Matrix(this.column, this.row, 0);

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                result.set(j, i, this.get(i, j));
            }
        }

        return (result);
    }
    /**
     * 矩阵乘法
     *   - this * ma
     * @param {(number[][] | Matrix)} ma
     * @returns {Matrix}
     */
    mul(ma: number[][] | Matrix): Matrix {
        const a = (ma instanceof Matrix) ? ma : (Matrix.from(ma));

        if (this.column !== a.row) {
            throw new Error('(matrix) this can not be multiplied with ma.');
        }

        // 乘法结果的行与列
        const row = this.row;
        const column = a.column;

        // 乘法计算
        const ans = new Matrix(row, column, 0);
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                let value = ans.get(i, j);
                for (let sub = 0; sub < this.column; sub++) {
                    value += this.get(i, sub) * a.get(sub, j);
                }
                ans.set(i, j, value);
            }
        }

        return (ans);
    }
    /**
     * 矩阵乘法
     *   - ma * this
     * @param {(number[][] | Matrix)} ma
     * @returns {Matrix}
     */
    multo(ma: number[][] | Matrix): Matrix {
        const a = (ma instanceof Matrix) ? ma : (Matrix.from(ma));

        if (this.column !== a.row) {
            throw new Error('(matrix) ma can not be multiplied with this.');
        }

        return a.mul(this);
    }
    /**
     * 矩阵加法
     *   - ma + this
     * @param {(number[][] | Matrix)} ma
     * @returns {Matrix}
     */
    add(ma: number[][] | Matrix): Matrix {
        const result = Matrix.from(ma);

        if (this.row !== result.row || this.column !== result.column) {
            throw new Error('(matrix) ma can not be add with this.');
        }

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                result.set(i, j, result.get(i, j) + this.get(i, j));
            }
        }

        return result;
    }

    /**
     * 矩阵数值缩放
     *  - num * this
     * @param num 放大系数
     */
    factor(num: number): Matrix {
        const result = Matrix.from(this);

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                result.set(i, j, result.get(i, j) * num);
            }
        }

        return result;
    }
    /**
     * 列主元 LU 三角分解，返回 L、U、P 矩阵
     * @returns {{ L: Matrix, U: Matrix, P: Matrix }}
     */
    luDecompose() {
        if (this.row !== this.column) {
            throw new Error('(matrix) only the matrix can be decomposed.');
        }

        const n = this.row;               // 行列式的行数
        const U = Matrix.from(this);      // 上三角行列式
        const L = new Matrix(n);          // 下三角行列式
        const P = new Matrix(n, 'E');     // 变换行列式，初始为单位矩阵

        for (let k = 0; k < n; k++) {
            if (k > 0) {
                for (let i = k; i < n; i++) {
                    L.set(i, k - 1, U.get(i, k - 1) / U.get(k - 1, k - 1));
                    for (let j = k; j < n; j++) {
                        const temp = U.get(i, j) - L.get(i, k - 1) * U.get(k - 1, j);
                        U.set(i, j, temp);
                    }
                    U.set(i, k - 1, 0);
                }
            }
            if (k < n - 1) {
                // 取绝对值最大的系数为主元
                let tempmax = 0, tempsub = 0;

                for (let i = k; i < n; i++) {
                    const now = Math.abs(U.get(i, k));
                    if (now > tempmax) {
                        tempmax = now;
                        tempsub = i;
                    }
                }

                // 交换主元
                if (tempsub !== 0) {
                    L.exchangeRow(k, tempsub);
                    U.exchangeRow(k, tempsub);
                    P.exchangeRow(k, tempsub);
                }
            }
        }

        // 下三角对角线为1
        for (let i = 0; i < n; i++) {
            L.set(i, i, 1);
        }

        return ({ L, U, P });
    }
    /**
     * 基于LU分解的矩阵求逆
     * @returns {Matrix}
     */
    inverse(): Matrix {
        const n = this.row;
        const { L, U, P } = this.luDecompose();

        for (let i = 0; i < U.row; i++) {
            if (U.get(i, i) === 0) {
                throw new Error('(matrix) this matrix has no inverse.');
            }
        }

        // L、U 的逆矩阵初始化
        const li = new Matrix(n);
        const ui = new Matrix(n);

        // U 的逆矩阵
        for (let i = 0; i < n; i++) {
            ui.set(i, i, 1 / U.get(i, i));
            for (let j = i - 1; j >= 0; j--) {
                let s = 0;
                for (let k = j + 1; k <= i; k++) {
                    s -= U.get(j, k) * ui.get(k, i);
                }
                ui.set(j, i, s / U.get(j, j));
            }
        }

        // L 的逆矩阵
        for (let i = 0; i < n; i++) {
            li.set(i, i, 1);
            for (let j = i + 1; j < n; j++) {
                let s = li.get(j, i);
                for (let k = i; k <= j - 1; k++) {
                    s -= L.get(j, k) * li.get(k, i);
                }
                li.set(j, i, s);
            }
        }

        // ul的逆矩阵相乘得到原矩阵的逆矩阵
        return ui.mul(li).mul(P);
    }
    /**
     * 向右串联矩阵，原矩阵不变，返回新矩阵
     * @param args {MatrixInput[]}
     */
    concatRight(...args: MatrixInput[]) {
        const matrixs = args.map(Matrix.from);
        const errIndex = matrixs.findIndex((ma) => ma.row !== this.row);

        if (errIndex >= 0) {
            throw new Error(`(matrix) The row number of the ${errIndex} matrix is not equal to this.`);
        }

        const totalCol = matrixs.reduce((col, ma) => col + ma.column, this.column);
        const result = new Matrix(this.row, totalCol, 0);

        // 添加 this 矩阵元素到 result
        this.forEach((n, [i, j]) => result.set(i, j, n));

        let lastCol = this.column;

        // 添加扩展矩阵元素到 result
        for (const ma of matrixs) {
            ma.forEach((n, [i, j]) => {
                result.set(i, j + lastCol, n);
            });

            lastCol += ma.column;
        }

        return result;
    }
    /**
     * 向下串联矩阵，原矩阵不变，返回新矩阵
     * @param args {MatrixInput[]}
     */
    concatDown(...args: MatrixInput[]) {
        const matrixs = args.map((Matrix.from));
        const errIndex = matrixs.findIndex((ma) => ma.column !== this.column);

        if (errIndex >= 0) {
            throw new Error(`(matrix) The column number of the ${errIndex} matrix is not equal to this.`);
        }

        const totalRow = matrixs.reduce((row, ma) => row + ma.row, this.row);
        const result = new Matrix(totalRow, this.column, 0);

        // 添加 this 矩阵元素到 result
        this.forEach((n, [i, j]) => result.set(i, j, n));

        let lastRow = this.row;

        // 添加扩展矩阵元素到 result
        for (const ma of matrixs) {
            ma.forEach((n, [i, j]) => {
                result.set(i + lastRow, j, n);
            });

            lastRow += ma.row;
        }

        return result;
    }
    /**
     * forEach 迭代
     *  - 从第一行开始，从左至右
     * @param {(value: number, position: [number, number]) => number} callback
     * @returns {this}
     */
    forEach(callback: (value: number, position: [number, number]) => any) {
        for (let i = 0; i < this._view.length; i++) {
            const x = Math.floor(i / this.column);
            const y = i % this.column;

            callback(this._view[i], [x, y]);
        }
    }
    /**
     * map 迭代
     *  - 从第一行开始，从左至右
     * @param {(value: number, position: [number, number]) => number} callback
     * @returns {this}
     */
    map(callback: (value: number, position: [number, number]) => number) {
        const newMa = Matrix.from(this);

        for (let i = 0; i < newMa._view.length; i++) {
            const x = Math.floor(i / newMa.column);
            const y = i % newMa.column;
            const result = callback(newMa._view[i], [x, y]);

            newMa._view[i] = result;
        }

        return newMa;
    }
    /**
     * 过滤矩阵的位置
     * @param callback 一个数字或者是回调
     *  - 数字相等或者是回调返回 true，此时矩阵元素的位置会被记录
     */
    filterPostion(callback: number | ((value: number, position: [number, number]) => boolean)) {
        const position: Array<[number, number]> = [];
        const pre = isNumber(callback) ? (val: number) => val === callback : callback;

        for (let i = 0; i < this._view.length; i++) {
            const x = Math.floor(i / this.column);
            const y = i % this.column;
            const result = pre(this._view[i], [x, y]);

            if (result) {
                position.push([x, y]);
            }
        }

        return position;
    }
}

/**
 * 输入的二维数组能否转化为矩阵
 *
 * @param {number[][]} ma
 * @returns {{ row: number; column: number })}
 */
function calMatrixSize(ma: number[][]): { row: number; column: number } {
    // 记录行列数
    const row = ma.length, column = ma[0].length;

    // 行连续
    if (!Object.keys(ma).every((n, i) => +n === i)) {
        throw new Error('(matrix) this is not a matrix.');
    }

    // 列连续且列长均相等
    if (!ma.every((col) =>
        isArray(col) && col.length === column &&
        Object.keys(col).every((n, i) => +n === i) &&
        Object.values(col).every((n) => isNumber(n) && !Number.isNaN(n)),
    )) {
        throw new Error('(matrix) this is not a matrix.');
    }

    return ({ row, column });
}
