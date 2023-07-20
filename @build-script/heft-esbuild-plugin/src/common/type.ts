import type { HeftConfiguration, IScopedLogger } from '@rushstack/heft';
import type ESBuild from 'esbuild';

export type ESBuildPublicApi = typeof ESBuild;

export interface IGlobalSession {
	/** see type define */
	logger: IScopedLogger;
	/** name in heft.json */
	taskName: string;
	/** directory contains project package.json */
	rootDir: string;
	/** options in heft.json task define */
	options: string;
	/** a temp dir, will delete when --clean */
	tempFolderPath: string;
	/** @see @rushstack/rig-package */
	rigConfig: HeftConfiguration['rigConfig'];
	/** resolve dependency package from project and rig, return absolute path */
	resolve(packageName: string): Promise<string>;
	/** define globs to watch, relative to rootDir */
	watchFiles(files: string[]): void;
}
