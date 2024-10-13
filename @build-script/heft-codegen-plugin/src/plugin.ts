import type { IHeftTaskRunIncrementalHookOptions } from '@rushstack/heft';

import { TsPluginInstance, createTaskPlugin, parseSingleTsConfigJson } from '@build-script/heft-plugin-base';
import { IResult, run } from './share';

export class CodeGenPlugin extends TsPluginInstance<{}> {
	private reverseChangeMap: Record<string, string> = {};

	private readonly exclude = ['**/*.generated.*', '.*', '.*/**/*', '**/node_modules/**'];
	private readonly include = ['**/*.generator.ts', '**/*.generator.js'];

	private handle_error(result: IResult) {
		if (result.errors.length > 0) {
			for (const item of result.errors) {
				this.session.logger.emitError(item);
			}
		}
	}

	private passOpts() {
		return {
			logger: this.logger,
			root: this.configuration.buildFolderPath,
		};
	}

	override async run() {
		const command = await this.listGenFiles();

		if (command.fileNames.length === 0) {
			this.session.logger.terminal.writeLine('no generator found.');
			return;
		}

		const result = await run(command.fileNames, this.passOpts());

		this.handle_error(result);
	}

	private rootDir?: string;
	override async watch(watchOptions: IHeftTaskRunIncrementalHookOptions): Promise<void> {
		const watchFiles = [...this.include, ...Object.keys(this.reverseChangeMap)];

		if (!this.rootDir) {
			const command = await this.listGenFiles();
			this.rootDir = command.options.rootDir;
			watchFiles.push('**/*');
		}

		// console.error('watchGlobAsync()', watchFiles);
		const map = await watchOptions.watchGlobAsync(watchFiles, {
			cwd: this.rootDir,
			absolute: true,
			ignore: this.exclude,
		});
		// console.error('map=', map);

		const files = new Set<string>();
		for (const [file, { changed }] of map.entries()) {
			if (!changed) continue;

			if (this.reverseChangeMap[file]) {
				files.add(this.reverseChangeMap[file]);
			} else if (file.endsWith('.generator.ts')) {
				files.add(file);
			}
		}
		// console.error('files=', files);

		if (files.size === 0) {
			this.session.logger.terminal.writeLine('no generator found or changed.');
			return;
		}

		const result = await run([...files.values()], this.passOpts());

		this.reverseChangeMap = {};
		for (const [inFile, deps] of Object.entries(result.watchFiles)) {
			for (const dep of deps) {
				this.reverseChangeMap[dep] = inFile;
			}
		}
		// console.error('reverseChangeMap=', this.reverseChangeMap);

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
