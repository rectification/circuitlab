import Koa from 'koa';
import Webpack from 'webpack';
import Mfs from 'memory-fs';

import baseConfig from './webpack.base';

import { join } from 'path';
import { getType } from 'mime';
import { output } from './config';

import * as fs from 'fs-extra';

const host = 'localhost';
const port = 8080;
const app = new Koa();
const mfs = new Mfs();

// 每个模块用 eval() 执行, SourceMap 作为 DataUrl 添加到文件末尾
baseConfig.devtool = 'eval-source-map';
// 调试用的插件
baseConfig.plugins!.push(new Webpack.NoEmitOnErrorsPlugin());

const compiler = Webpack(baseConfig);

compiler.outputFileSystem = mfs as any;

compiler.watch(
    { ignored: /node_modules/ },
    (err, stats) => {
        console.log('\x1Bc');

        if (err) {
            console.error(err.stack || err);
        }
        else if (stats) {
            console.log(stats.toString({
                chunks: false,
                chunkModules: false,
                chunkOrigins: false,
                colors: true,
                modules: false,
                children: false,
            }));

            console.log(`\nYour application is already set at http://${host}:${port}/.\n`);
        }
    },
);

app.listen(port);

app.use((ctx, next) => {
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
        ctx.status = 405;
        ctx.length = 0;
        ctx.set('Allow', 'GET, HEAD');
        next();
        return (false);
    }

    const filePath = ctx.path[ctx.path.length - 1] === '/'
        ? join(output, ctx.path, 'index.html')
        : join(output, ctx.path);

    if (!mfs.existsSync(filePath)) {
        ctx.status = 404;
        ctx.length = 0;
        next();
        return (false);
    }

    ctx.type = getType(filePath)!;
    ctx.lastModified = new Date();

    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Cache-Control', 'max-age=0');

    ctx.body = mfs.readFileSync(filePath);

    next();
});
