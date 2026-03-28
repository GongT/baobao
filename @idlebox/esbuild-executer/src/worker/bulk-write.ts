import type { BuildOptions, Metafile, OutputFile } from 'esbuild';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { logger } from './logger.js';

function noop(..._args: any[]) {
	return Promise.resolve();
}

export class FileBulkWriter {
	private readonly jobs: [string, Uint8Array][] = [];
	private hash: string = '';
	private readonly mkdir: Promise<any>;
	private readonly outDir: string;
	private metafileData?: Metafile;

	constructor(
		private readonly options: BuildOptions,
		shouldWrite: boolean,
	) {
		assert.ok(options.outdir);

		this.outDir = options.outdir;
		if (shouldWrite) {
			this.mkdir = mkdir(this.outDir, { recursive: true });
		} else {
			this.mkdir = Promise.resolve();
			this.write = noop;
			this.metafile = noop;
			this.finish = noop;
			logger.worker`compile with write: false, compiled files will be kept in memory and never written to disk`;
		}
	}

	write(file: OutputFile, append?: string) {
		logger.worker`write result file to ${file.path}`;
		this.hash += file.hash;
		let b: Uint8Array = file.contents;
		if (append) {
			const app = Buffer.from(append, 'utf-8');
			b = Buffer.concat([file.contents, app]);
		}
		this.jobs.push([file.path, b]);
	}

	metafile(metafile: Metafile) {
		this.metafileData = metafile;
	}

	async finish() {
		await this.mkdir;

		const pm = (async () => {
			if (!this.metafileData) return;

			this.hash = reHash(this.hash);
			logger.worker`write metadata to ${this.outDir}/.metafile.${this.hash}.json`;
			const metaData = {
				options: this.options,
				...this.metafileData,
			};
			const metaText = JSON.stringify(metaData, null, 2);
			const metaFile = `${this.outDir}/.metafile.${this.hash}.json`;
			await writeFile(metaFile, metaText, 'utf-8');
		})();

		const pss = this.jobs.map(([path, contents]) => {
			if (process.env.WRITE_COMPILE_RESULT) {
				logger.error`write file to ${path}`;
			} else {
				logger.worker`write file to ${path}`;
			}
			return writeFile(path, contents);
		});

		await Promise.all([pm, ...pss]);
	}
}

function reHash(str: string) {
	return createHash('shake128', { outputLength: 8 }).update(str).digest('hex');
}
