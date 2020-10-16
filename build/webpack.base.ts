import { resolve, version } from './utils';

import chalk from 'chalk';
import Webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import example from './ts-json';
import * as config from './config';

const isDevelopment = process.env.NODE_ENV === 'development';

const banner =
`Project: Circuit Simulator
Author: 2016 - ${new Date().getFullYear()} © XiaoBoost

Build: ${version}
filename: [name], chunkhash: [chunkhash]

Nice to meet you ~ o(*￣▽￣*)ブ
Released under the MIT License.`;

console.log('\x1Bc');

// 编译 example
// example();

const baseConfig: Webpack.Configuration = {
    mode: process.env.NODE_ENV as Webpack.Configuration['mode'],
    entry: {
        main: resolve('src/init/index.ts'),
    },
    output: {
        path: config.output,
        publicPath: config.publicPath,
        filename: isDevelopment ? 'js/[name].js' : 'js/[name].[chunkhash].js',
        chunkFilename: isDevelopment ? 'js/[name].js' : 'js/[name].[chunkhash].js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json', '.styl', '.css'],
        mainFiles: ['index.tsx', 'index.ts', 'index.js', 'index.styl'],
        alias: {
            src: resolve('src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    configFile: resolve('tsconfig.build.json'),
                    compilerOptions: {
                        target: isDevelopment ? 'esnext' : 'es6',
                    },
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.styl(us)?$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentContext: resolve('src'),
                                exportLocalsConvention: 'camelCaseOnly',
                                localIdentName: isDevelopment ? '[local]__[hash:base64:5]' : '[hash:base64:6]',
                            },
                        },
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            stylusOptions: {
                                paths: [
                                    resolve('node_modules'),
                                    resolve('src/styles'),
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        concatenateModules: true,
        moduleIds: 'deterministic',
        splitChunks: {
            maxInitialRequests: Infinity,
            minSize: 0,
            minChunks: 1,
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/][\d\D]+?\.(t|j)s/,
                    name: 'common',
                    chunks: 'all',
                },
            },
        },
    },
    plugins: [
        // 添加文件抬头信息
        new Webpack.BannerPlugin({
            banner,
            entryOnly: false,
        }),
        // 定义全局注入变量
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"',
        }),
        // 提取出来的所有 css 文件整合
        new MiniCssExtractPlugin({
            filename: isDevelopment
                ? 'styles/main.css'
                : 'styles/main.[contenthash:20].css',
        }),
        // 复制文件
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: config.assert,
                    to: isDevelopment ? config.publicPath : config.output,
                },
            ],
        }),
        // 打包后的文件插入 html 模板
        new HtmlWebpackPlugin({
            filename: 'index.html',
            data: {
                build: version,
                year: new Date().getFullYear(),
            },
            template: resolve('src/index.html'),
            inject: true,
            minify: {
                removeComments: !isDevelopment,
                collapseWhitespace: !isDevelopment,
                ignoreCustomComments: [/^-/],
            },
        }),
        new ProgressBarPlugin({
            width: 40,
            format: `${chalk.green('> building:')} [:bar] ${chalk.green(':percent')} (:elapsed seconds)`,
        }),
    ],
};

export default baseConfig;
