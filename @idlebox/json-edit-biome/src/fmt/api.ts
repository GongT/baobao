import type { Configuration } from '@biomejs/js-api/nodejs';
import { WeakReferenceCounter } from '@idlebox/common';
import type { IFormatter } from '@idlebox/json-edit';
import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';
import type { IBiomeFormatOptions } from './options.js';

type BiomeApi = import('@biomejs/js-api/nodejs').Biome;
export let Biome: new () => BiomeApi;
try {
	Biome = (await import('@biomejs/js-api/nodejs')).Biome;
} catch {}

interface ILoadedProject {
	readonly configFile: string | null;
	readonly config?: Configuration;
	readonly projectKey: number;
}

// 多个对象需共享BiomeApi
let engine: WeakReferenceCounter<BiomeApi>;

export class BiomeApiFormat implements IFormatter<IBiomeFormatOptions> {
	constructor(protected options: IBiomeFormatOptions = {}) {
		if (!engine) {
			engine = new WeakReferenceCounter({
				construct() {
					return new Biome();
				},
				destroy(b: BiomeApi) {
					b.shutdown();
				},
				deletionTimeout: 5000,
			});
		}
	}

	learnText(_text: string) {}
	learnFile() {}

	setOptions(options: IBiomeFormatOptions): void {
		this.options = options;
	}
	getOptions(): IBiomeFormatOptions {
		return this.options;
	}
	clone(): IFormatter<IBiomeFormatOptions> {
		return new BiomeApiFormat({ ...this.options });
	}

	private readonly loaded = new Map<string, ILoadedProject>();
	/**
	 * 根据path获取对应的 ProjectKey
	 * 并应用对应的配置（如需要的话）
	 *
	 * Note: 配置文件支持 biome.json/biome.jsonc
	 * 加载extends，但不支持 root=false
	 */
	configure(path: string) {
		using biome = engine.get();

		const configFile = findUpUntilSync({
			file: ['biome.json', 'biome.jsonc'],
			from: path,
		});

		const dir = dirname(configFile ?? path);

		const exists = this.loaded.get(dir);
		if (exists !== undefined) {
			return exists;
		}

		const { projectKey } = biome.openProject(dir);
		const config: Configuration = {};
		const r = { configFile: configFile, projectKey, config };
		this.loaded.set(dir, r);
		// console.log('biome.open: %s --> %d', dir, projectKey);

		if (configFile) {
			const data = loadInheritedJson(configFile);
			if (data.root === false) {
				console.warn('BiomeApi: 目前不支持使用 root=false');
			}
			config.formatter = data.formatter;
			config.json = data.json;
			config.overrides = data.overrides;
			config.root = data.root;
			config.vcs = { enabled: false };
			config.files = { ignoreUnknown: false };
		}

		return r;
	}

	private _formatText(content: string, filepath: string, _extra_config?: IBiomeFormatOptions) {
		using biome = engine.get();

		const { projectKey, config } = this.configure(filepath);
		if (config) {
			biome.applyConfiguration(projectKey, config);
		}

		const data = biome.formatContent(projectKey, content, { filePath: filepath });
		if (data.diagnostics.length) {
			console.error(biome.printDiagnostics(data.diagnostics, { filePath: filepath, fileSource: content, verbose: true }));
		}

		return data.content;
	}

	async format(content: string, filepath?: string): Promise<string> {
		// console.log('formatting content for filepath:', filepath);
		let cwd;
		let notePath;
		if (filepath) {
			cwd = dirname(filepath);
			notePath = filepath;
		} else {
			if (this.options?.workspace) {
				cwd = this.options.workspace;
				notePath = resolve(this.options.workspace, 'file.jsonc');
			} else {
				cwd = process.cwd();
				notePath = resolve(cwd, 'file.jsonc');
			}
		}

		const result = this._formatText(content, notePath, this.options);

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
}
