import { execute } from '@idlebox/esbuild-executer';

/**
 * 开发模式入口
 * 不依赖本项目的其他包，直接把所有文件从ts文件打包到一起，主要用于生成common包
 */

await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
