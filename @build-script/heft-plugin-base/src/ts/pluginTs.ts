import type { IHeftTaskRunIncrementalHookOptions } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';
import { PluginInstance } from '../misc/pluginBase.js';
import { getTypeScript } from './getTypeScript.js';
import { loadTsConfigJson, type ILoadConfigOverride, type ILoadedConfigFile } from './loadTsConfigJson.js';

export abstract class TsPluginInstance<OptionsT> extends PluginInstance<OptionsT & ILoadConfigOverride> {
	protected ts!: typeof TypeScriptApi;
	protected configFilesMtime = new Map<string, Date>();
	private currentCommand?: ILoadedConfigFile;

	override async init() {
		this.ts = await getTypeScript(this.session, this.configuration);
		this.loadTsConfig();
	}

	protected loadTsConfig(): ILoadedConfigFile {
		if (!this.currentCommand || this._diff_mtime()) {
			this.currentCommand = loadTsConfigJson(
				this.session.logger,
				this.ts,
				this.configuration.rigConfig,
				this.pluginOptions,
			);
			this._read_mtimes(this.currentCommand.configFiles);
		}
		return this.currentCommand;
	}

	private _read_mtimes(files: readonly string[]) {
		this.configFilesMtime.clear();
		for (const file of files) {
			const mtime = this.ts.sys.getModifiedTime!(file);
			if (!mtime) {
				throw new Error('not get mtime from file: ' + file);
			}
			this.configFilesMtime.set(file, mtime);
		}
	}

	private _diff_mtime(): boolean {
		for (const [file, mtime] of this.configFilesMtime) {
			if (mtime !== this.ts.sys.getModifiedTime!(file)) {
				return true;
			}
		}
		return false;
	}

	protected async loadTsConfigWatch({
		watchGlobAsync,
	}: IHeftTaskRunIncrementalHookOptions): Promise<ILoadedConfigFile & { files: string[] }> {
		const { command, configFiles } = this.loadTsConfig();
		const watch = [...configFiles];

		if (command.raw?.include) {
			watch.push(...command.raw?.include);
		}
		if (command.raw?.files) {
			watch.push(...command.raw?.files);
		} else {
			const compilerOptions = command.options;
			watch.push('**/*.ts');
			watch.push('**/*.tsx');
			if (compilerOptions.resolveJsonModule) {
				watch.push('**/*.json');
			}
			if (compilerOptions.allowJs) {
				watch.push('**/*.js');
				watch.push('**/*.jsx');
			}
		}

		// console.log('watch (%s):', command.options.rootDir, watch);
		const map = await watchGlobAsync(watch, {
			cwd: command.options.rootDir,
			absolute: true,
			ignore: command.raw?.exclude,
		});
		// console.log('result:', map);

		const files = [];
		for (const [file, { changed }] of map.entries()) {
			if (!changed) continue;

			files.push(file);
		}

		return { files, configFiles, command };
	}
}
