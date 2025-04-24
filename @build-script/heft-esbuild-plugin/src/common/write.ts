import type { IHeftTaskSession } from '@rushstack/heft';
import type { Metafile } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { FilterdBuildOptions } from './config.js';
import type { IOutputModifier } from './type.js';
import { OutputFile } from './write.helper.js';

export interface IProjectEmitterProps {
	readonly metafile: Metafile;
	readonly outputFiles: import('esbuild').OutputFile[];
	readonly options: FilterdBuildOptions;
	readonly session: IHeftTaskSession;
}

export type IProjectEmitter = (props: IProjectEmitterProps) => Promise<IInternalReturn> | IInternalReturn;

interface IInternalCache {
	writeFile: Map<string, string>;
	custom: any;
}

export function createEmitter(onEmit?: IOutputModifier): IProjectEmitter {
	const cache: IInternalCache = {
		custom: undefined,
		writeFile: new Map(),
	};

	return async ({ metafile, outputFiles, options, session }) => {
		const files: OutputFile[] = [];
		let writtenFiles = 0;

		Object.assign(metafile, { root: options.outdir });
		const metaOut = resolve(options.outdir, 'metafile.json');
		files.push(new OutputFile(metaOut, JSON.stringify(metafile, null, 4)));

		for (const file of outputFiles) {
			files.push(new OutputFile(file.path, file.contents, file.hash));
		}

		if (onEmit) {
			cache.custom = await onEmit(files, options, cache.custom);
		}

		const lastCache = cache.writeFile;
		cache.writeFile = new Map();

		for (const item of files) {
			if (!item.path || !item.contents) {
				throw new Error(`invalid file: ${JSON.stringify(item)}`);
			}
			const content = item.contents || Buffer.from(item.text, 'utf-8');
			cache.writeFile.set(item.path, item.hash);

			if (lastCache.get(item.path) === cache.writeFile.get(item.path)) {
				session.logger.terminal.writeDebugLine('write file: ', item.path, ' - unchange');
				continue;
			}

			try {
				await mkdir(dirname(item.path), { recursive: true });
				await writeFile(item.path, content);
				writtenFiles++;

				session.logger.terminal.writeLine('write file: ', item.path, ' - ok');
			} catch (e) {
				session.logger.terminal.writeWarningLine('write file: ', item.path, ' - failed');
				throw e;
			}
		}

		for (const file of lastCache.keys()) {
			if (!cache.writeFile.has(file)) {
				session.logger.terminal.writeLine('write file: ', file, ' - deleted');
				await rm(file);
			}
		}

		return { writtenFiles };
	};
}

interface IInternalReturn {
	readonly writtenFiles: number;
}
