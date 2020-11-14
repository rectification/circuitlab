import { resolve } from './utils';

/** 静态资源 */
export const assert = resolve('src/assets/');
/** 构建输出的文件路径 */
export const output = resolve('dist/');
/** 构建时是否显示模块组成分析 */
export const bundleAnalyzer = true;
/** 调试时的公共路径 */
export const publicPath = '/';
