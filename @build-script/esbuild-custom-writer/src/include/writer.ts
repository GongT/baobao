import { md5 } from '@idlebox/node';
import type { BuildResult, Plugin, PluginBuild } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import type { IPluginOptions } from '../main.js';
import { ChainCallbackList } from './callbacks.js';
import type { IEntry, IFile, IOnEmitFileCallback } from './file.js';

export class CustomFileWriter implements Plugin {
	readonly name = 'file-write';
	readonly #callbacks = new ChainCallbackList();
	readonly #cache = new Map<string, IFile>();
	readonly #options;
	#rootDir!: string;

	constructor(options: IPluginOptions = {}) {
		this.#options = {
			quiet: !!options.quiet,
			clearScreen: options.clearScreen ?? true,
			cache: options.cache ?? true,
			delete: options.delete ?? true,
		};
		this.setup = this.setup.bind(this);
	}

	onEmitFile(callback: IOnEmitFileCallback) {
		this.#callbacks.add(callback);
	}

	async setup(build: PluginBuild) {
		const rootDir = build.initialOptions.absWorkingDir || process.cwd();
		if (build.initialOptions.write !== false) {
			throw new Error("esbuild options.write must be false, or custom file writer won't work.");
		}

		this.#rootDir = rootDir;

		if (!this.#options.quiet) {
			let firstRun = true;
			build.onStart(() => {
				if (firstRun) {
					firstRun = false;
				} else if (this.#options.clearScreen) {
					process.stderr.write('\x1Bc');
				}
				console.log('[esbuild] build started');
			});
			build.onEnd((result) => {
				for (const { text, location } of result.errors) {
					console.error(`✘ [ERROR] ${text}`);
					if (location) {
						console.error(`    ${location.file}:${location.line}:${location.column}:`);
					}
				}
				for (const { text, location } of result.warnings) {
					console.error(`✘ [WARNING] ${text}`);
					if (location) {
						console.error(`    ${location.file}:${location.line}:${location.column}:`);
					}
				}
				console.log('[esbuild] build finished');
			});
		}

		build.onEnd(async (result) => {
			if (result.errors.length) {
				return;
			}

			const list = [];

			for (const efile of result.outputFiles!) {
				const rel = relative(rootDir, efile.path);

				const fileObj: IFile = {
					relative: rel,
					contents: efile.contents,
					hash: efile.hash,
					path: efile.path,
				};

				const prev = this.#cache.get(rel);
				const entry = this.getEntry(result, rel);

				const outFile = await this.#callbacks.call(fileObj, entry, prev);
				if (outFile === false) {
					console.debug('skip emit: %s', fileObj.path);
					continue;
				}

				list.push(outFile || efile);
			}
			console.log('%d files to emit.', list.length);

			for (const [key, item] of [...this.#cache.entries()]) {
				if (list.includes(item)) continue;
				this.#cache.delete(key);

				if (this.#options.delete) {
					// todo: delete fs
				}
			}

			for (const item of list) {
				await this.writeFile(item);
			}
		});
	}
	async writeFile(item: IFile) {
		const old = this.#cache.get(item.relative);
		if (old?.hash === item.hash && this.#options.cache) {
			console.log('[file-write] unchange file: %s', item.path);
			return;
		}

		console.log('[file-write] write file: %s', item.path);
		await writeFile(item.path, item.contents);

		this.#cache.set(item.relative, item);
	}

	readonly #idCache = new Map<string, string>();
	private getEntry(result: BuildResult, file: string): IEntry {
		const rel = this.getEntryPath(result, file);
		let id = this.#idCache.get(rel);
		if (!id) {
			id = md5(randomBytes(32));
			this.#idCache.set(rel, id);
		}

		return {
			id,
			path: resolve(this.#rootDir, rel),
			relative: rel,
		};
	}

	private getEntryPath(result: BuildResult, file: string) {
		const outputs = result.metafile?.outputs;
		if (outputs) {
			if (outputs[file]?.entryPoint) {
				return outputs[file]?.entryPoint;
			}
			if (file.endsWith('.map')) {
				const base = file.replace(/\.map$/, '');
				if (outputs[base]?.entryPoint) {
					return outputs[base]?.entryPoint;
				}
			}
		}

		throw new Error(`can not find entry file for output "${file}", ${this.name} plugin internal failure`);
	}
}
