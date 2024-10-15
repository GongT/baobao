import {
	PluginInstance,
	createTaskPlugin,
	parseSingleTsConfigJson,
	type IWatchOptions,
} from '@build-script/heft-plugin-base';
import type TypeScriptApi from 'typescript';
import { GeneratorHolder, type IResult } from './library/code-generator-holder.js';

export class CodeGenPlugin extends PluginInstance<{}> {
	private declare readonly generaters: GeneratorHolder;
	private declare readonly ts: typeof TypeScriptApi;
	private declare readonly rootDir: string;

	private readonly exclude = ['**/*.generated.*', '.*', '.*/**/*', '**/node_modules/**'];
	private readonly include = ['**/*.generator.ts', '**/*.generator.js'];

	override async init() {
		super.init();
		const ts = await this.configuration.rigPackageResolver.resolvePackageAsync(
			'typescript',
			this.session.logger.terminal,
		);
		Object.assign(this, { ts: require(ts) });

		const command = await this.listGenFiles();
		const rootDir = command.options.rootDir || this.configuration.buildFolderPath;

		Object.assign(this, {
			generaters: new GeneratorHolder(this.logger, rootDir),
			rootDir,
		});
	}
	private handle_error(result: IResult) {
		if (result.errors.length > 0) {
			for (const item of result.errors) {
				this.session.logger.emitError(item);
			}
		}
	}

	override async run() {
		const command = await this.listGenFiles();
		await this.generaters.makeGenerators(command.fileNames, false);

		if (command.fileNames.length === 0) {
			this.session.logger.terminal.writeLine('no generator found.');
			return;
		}

		const result = await this.generaters.executeAll();
		this.handle_error(result);
	}

	override async watch(woptions: IWatchOptions): Promise<void> {
		const command = await this.listGenFiles();
		await this.generaters.makeGenerators(command.fileNames, false);

		const watchFiles = [...this.generaters.watchingFiles];
		// this.logger.verbose('watchGlobAsync()', watchFiles);
		const map = await woptions.watchGlobAsync(watchFiles, {
			cwd: this.configuration.buildFolderPath,
			absolute: true,
			ignore: this.exclude,
		});
		// this.logger.verbose('watchGlobAsync->map:', map);

		const files = new Set<string>();
		for (const [file, { changed }] of map.entries()) {
			if (changed) {
				files.add(file);
			}
		}
		// console.error('files=', files);

		if (files.size === 0) {
			// TODO: block run if last error
			this.session.logger.terminal.writeLine('no generator found or changed.');
			return;
		}

		const result = await this.generaters.executeRelated(files);

		this.handle_error(result);
	}

	private async listGenFiles() {
		const options = {
			exclude: this.exclude,
			files: [],
			include: this.include,
		};
		return parseSingleTsConfigJson(this.session.logger, this.ts, this.configuration.rigConfig, options);
	}
}

export default createTaskPlugin('codegen', CodeGenPlugin);
