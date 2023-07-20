import { IScopedLogger } from '@rushstack/heft';
import type ESBuild from 'esbuild';

export type ESBuildPublicApi = typeof ESBuild;

export interface IGlobalSession {
	logger: IScopedLogger;
	taskName: string;
	rootDir: string;
	options: string;
	tempFolderPath: string;
	watchFiles(files: string[]): void;
}
