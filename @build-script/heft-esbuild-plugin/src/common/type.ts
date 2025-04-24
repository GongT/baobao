import type { HeftConfiguration, IScopedLogger } from '@rushstack/heft';
import type ESBuild from 'esbuild';
import type { FilterdBuildOptions } from './config.js';

export type ESBuildPublicApi = typeof ESBuild;

export interface IGlobalSession {
	/** see type define */
	readonly logger: IScopedLogger;
	/** name in heft.json */
	readonly taskName: string;
	/** directory contains project package.json */
	readonly rootDir: string;
	/** options in heft.json task define */
	readonly options: string;
	/** a temp dir, will delete when --clean */
	readonly tempFolderPath: string;
	/** @see @rushstack/rig-package */
	readonly rigConfig: HeftConfiguration['rigConfig'];
	/** resolve dependency package from project and rig, return absolute path */
	resolve(packageName: string): PromiseLike<string>;
	/** define globs to watch, relative to rootDir */
	watchFiles(files: string[]): void;
	/** require('esbuild') */
	readonly esbuild: ESBuildPublicApi;
}

/**
 * you can `export function onEmit() {}` to modify file content before write disk
 *
 * don't write file by your self in this function.
 *
 * @param files all files will be write to disk, this array can be add, remove, or modify.
 * @param options is what you defined in options.
 * @return value will be passed to next onEmit (undefined on first run), only have meaning in watch mode
 **/
export type IOutputModifier<T = any> = (
	files: ESBuild.OutputFile[],
	options: FilterdBuildOptions,
	lastReturn?: T
) => T | PromiseLike<T>;
