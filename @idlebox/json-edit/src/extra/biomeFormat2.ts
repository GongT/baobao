import { Biome, type Configuration } from '@biomejs/js-api/nodejs';
import { readJsonFile } from '@idlebox/json-extends-loader';
import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';
import type { IFormatter } from '../api/types.js';

interface ICfg {
	readonly workspace?: string;
}

interface IRef {
	count: number;
	readonly key: number;
}

interface IFormatterInstance extends Disposable {
	format(content: string, filepath: string): string;
}

class BiomeApiRefCounter {
	private readonly map = new Map<string, IRef>();
	private biome?: Biome;

	instance(path: string): IFormatterInstance {
		const configFile = findUpUntilSync({
			file: ['biome.json', 'biome.jsonc'],
			from: path,
		});

		const biome = this._init();

		const dir = configFile ? dirname(configFile) : dirname(path);
		const r = this.map.getOrInsertComputed(dir, () => {
			const { projectKey } = biome.openProject(dir);
			// console.log('biome.open: %s --> %d', dir, projectKey);

			const config: Configuration = {};
			if (configFile) {
				const data = readJsonFile(configFile);
				config.formatter = data.formatter;
				config.json = data.json;
				config.overrides = data.overrides;
				config.root = data.root;
				config.vcs = { enabled: false };
				config.files = { ignoreUnknown: false };
			}

			biome.applyConfiguration(projectKey, config);
			return {
				count: 0,
				key: projectKey,
			};
		});

		r.count++;
		// console.log('biome.ref+: %s::%d --> %d', dir, r.key, r.count);

		let disposed = false;
		return {
			[Symbol.dispose]: () => {
				if (!disposed) {
					disposed = true;
					this._decrease(dir);
				}
			},
			format(content: string, filepath: string) {
				const data = biome.formatContent(r.key, content, { filePath: filepath });
				if (data.diagnostics.length) {
					console.error(biome.printDiagnostics(data.diagnostics, { filePath: filepath, fileSource: content, verbose: true }));
				}
				return data.content;
			},
		};
	}

	private _decrease(pkg: string) {
		const r = this.map.get(pkg);
		if (!r) {
			throw new Error(`Package not found in BiomeApiRefCounter: ${pkg}`);
		}

		r.count--;
		// console.log('biome.ref-: %s::%d --> %d', pkg, r.key, r.count);

		if (r.count === 0) {
			this.map.delete(pkg);
			if (this.map.size === 0) {
				this._close();
			}
		}
	}

	private collectTimer: NodeJS.Timeout | null = null;
	private _close() {
		if (this.biome) {
			// console.log('should close Biome instance');
			if (this.collectTimer) {
				clearTimeout(this.collectTimer);
			}
			this.collectTimer = setTimeout(() => {
				// console.log('really close Biome instance');
				this.collectTimer = null;
				this.biome?.shutdown();
				this.biome = undefined;
			}, 5000);
			this.collectTimer.unref();
		}
	}

	private _init() {
		if (!this.biome) {
			this.biome = new Biome();
		}
		this._resetTimer();
		return this.biome;
	}

	private _resetTimer() {
		if (this.collectTimer) {
			clearTimeout(this.collectTimer);
			this.collectTimer = null;
		}
	}

	dispose() {
		this._resetTimer();
		if (this.biome) {
			this.biome.shutdown();
			this.biome = undefined;
		}
	}
}

const refCounter = new BiomeApiRefCounter();

export class BiomeApiFormat implements IFormatter<ICfg> {
	constructor(protected current: ICfg = {}) {}

	static createInstance(_text?: string, _file?: string): Promise<IFormatter<ICfg>> {
		const r = new BiomeApiFormat({});
		return Promise.resolve(r);
	}

	setOptions(options: ICfg): void {
		this.current = options;
	}
	getOptions(): ICfg {
		return this.current ?? {};
	}

	async format(content: string, filepath?: string): Promise<string> {
		// console.log('formatting content for filepath:', filepath);
		let cwd;
		let notePath;
		if (filepath) {
			cwd = dirname(filepath);
			notePath = filepath;
		} else {
			if (this.current?.workspace) {
				cwd = this.current.workspace;
				notePath = resolve(this.current.workspace, 'file.jsonc');
			} else {
				cwd = process.cwd();
				notePath = resolve(cwd, 'file.jsonc');
			}
		}

		using handle = refCounter.instance(cwd);

		const result = handle.format(content, notePath);

		// if (result === content) {
		// 	console.log('content unchanged!!');
		// } else {
		// 	console.log('content changed by Biome formatter');
		// 	console.log('------------ new content:\n%s', result);
		// 	console.log('------------ old content:\n%s', content);
		// 	console.log('------------');
		// }
		return result;
	}

	clone(): IFormatter<ICfg> {
		return new BiomeApiFormat({ ...this.current });
	}
}
