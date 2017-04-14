const unit = /[EI]/;

// 矩阵类
class Matrix {
    constructor(row, column = row, value = 0) {
        if (row instanceof Array) {
            const data = [], size = Matrix.isMatrix(row);

            this.row = size.row;
            this.column = size.column;
            row.forEach((n) => data.push(...n));

            const buffer = new ArrayBuffer(this.row * this.column * 8);
            this._view = new Float64Array(buffer);
            this._view.set(data);
        } else if (row instanceof Matrix) {
            this.row = row.row;
            this.column = row.column;
            this._view = Float64Array.from(row._view);
        } else {
            this.row = row;
            this.column = row;
            // 开辟内存空间
            const buffer = new ArrayBuffer(this.row * this.column * 8);
            this._view = new Float64Array(buffer);
            // 单位矩阵对角线元素赋值
            if (unit.test(column) || unit.test(value)) {
                for (let i = 0; i < row; i++) {
                    this._view[i * (row + 1)] = 1;
                }
            }
        }
    }

    static isMatrix(ma) {
        if (ma instanceof Matrix) {
            return ({ row: ma.row, column: ma.column });
        }

        // 记录行列数
        const row = ma.length, column = ma[0].length;
        // 行连续
        if (!Object.keys(ma).every((n, i) => +n === i)) {
            return (false);
        }
        // 列连续切列长均相等
        if (!Object.values(ma).every((col) => {
            return col.length === column &&
                Object.keys(col).every((n, i) => +n === i) &&
                Object.values(col).every((n) => !Number.isNaN(+n));
        })) {
            return (false);
        }

        return ({ row, column });
    }
    static combination() {
        //
    }

    // 取出矩阵元素
    get(i, j) {
        return this._view[i * this.row + j];
    }
    // 设置矩阵值
    set(i, j, value) {
        this._view[i * this.row + j] = value;
    }
    // 输出字符串
    join(str) {
        return this._view.join(str);
    }

    // 交换坐标元素a、b所在行、列
    exchange(a, b) {
        // 交换行
        if (a[0] !== b[0]) {
            const start = a[0] * this.row,
                end = b[0] * this.row;
            for (let i = 0; i < this.row; i++) {
                const temp = this._view[start + i];
                this._view[start + i] = this._view[end + i];
                this._view[end + i] = temp;
            }
        }
        // 交换列
        if (a[1] !== b[1]) {
            const start = a[1] * this.column,
                end = b[1] * this.column;
            for (let i = 0; i < this.column; i++) {
                const nowRow = i * this.row,
                    temp = this._view[nowRow + start];
                this._view[nowRow + start] = this._view[nowRow + end];
                this._view[nowRow + end] = temp;
            }
        }
    }
    // this * ma
    mul(ma) {
        const a = (ma instanceof Matrix)
            ? ma
            : (new Matrix(ma));

        if (this.column !== a.row) {
            return (false);
        }

        // 乘法结果的行与列
        const row = this.row,
            column = a.column;

        // 乘法计算
        const ans = new Matrix(row, column);
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
    // ma * this
    multo(ma) {
        const a = (ma instanceof Matrix)
            ? ma
            : new Matrix(ma);

        return a.mul(this);
    }
    // 列主元 LU 三角分解，返回 LUP 矩阵
    luDecompose() {
        if (this.row !== this.column) {
            throw ('这不是行列式，无法三角分解');
        }

        const n = this.row,             // 行列式的行数
            U = new Matrix(this),       // 上三角行列式
            L = new Matrix(n),          // 下三角行列式
            P = new Matrix(n, 'E');     // 变换行列式，初始为单位矩阵

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
                L.exchange([k, 0], [tempsub, 0]);
                U.exchange([k, 0], [tempsub, 0]);
                P.exchange([k, 0], [tempsub, 0]);
            }
        }
        // 下三角对角线为1
        for (let i = 0; i < n; i++) {
            L.set(i, i, 1);
        }
        return ([L, U, P]);
    }
    // 基于LU分解的矩阵求逆
    inverse() {
        const [L, U, P] = this.luDecompose(), n = this.row;
        for (let i = 0; i < U.row; i++) {
            if (!U.get(i, i)) throw ('逆矩阵不存在');
        }

        // L、U的逆矩阵初始化
        const li = new Matrix(n),
            ui = new Matrix(n);

        //U的逆矩阵
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
        // L的逆矩阵
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
        const ans = ui.mul(li).mul(P);
        return (ans);
    }
}

function $m(...ma) {
    return new Matrix(...ma);
}

export { $m };
