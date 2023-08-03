import type { HeftConfiguration, IHeftTaskRunIncrementalHookOptions, IHeftTaskSession } from '@rushstack/heft';

import { parseSingleTsConfigJson } from '../../misc/loadTsConfigJson';
import { HeftTypescriptPlugin, ITypeScriptState } from '../../misc/pluginBase';
import { IOutputShim, createHeftLogger } from '../../misc/scopedLogger';
import { IResult, run } from './share';

interface IState extends ITypeScriptState {
	logger: IOutputShim;
}
export default class CodeGenPlugin extends HeftTypescriptPlugin<IState, {}> {
	override PLUGIN_NAME = 'codegen';
	private reverseChangeMap: Record<string, string> = {};

	private readonly exclude = ['**/*.generated.*', '.*', '.*/**/*', '**/node_modules/**'];
	private readonly include = ['**/*.generator.ts', '**/*.generator.js'];

	private handle(session: IHeftTaskSession, result: IResult) {
		session.logger.terminal.writeLine(
			'code generate complete: ',
			result.success.toFixed(0),
			' success, ',
			result.skip.toFixed(0),
			' unchanged, ',
			result.errors.length.toFixed(0),
			' error',
			result.errors.length > 1 ? 's' : '',
		);
		if (result.errors.length > 0) {
			for (const item of result.errors) {
				session.logger.emitError(item);
			}
		}
	}

	override async run(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const command = await this.listGenFiles(session, configuration);

		if (command.fileNames.length === 0) {
			session.logger.terminal.writeLine('no generator found.');
			return;
		}

		const result = await run(command.fileNames, this.state.logger);

		this.handle(session, result);
	}

	private rootDir?: string;
	override async runWatch(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		watchOptions: IHeftTaskRunIncrementalHookOptions,
	): Promise<void> {
		const watchFiles = [...this.include, ...Object.keys(this.reverseChangeMap)];

		if (!this.rootDir) {
			const command = await this.listGenFiles(session, configuration);
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
			session.logger.terminal.writeLine('no generator found or changed.');
			return;
		}

		const result = await run([...files.values()], this.state.logger);

		this.reverseChangeMap = {};
		for (const [inFile, deps] of Object.entries(result.watchFiles)) {
			for (const dep of deps) {
				this.reverseChangeMap[dep] = inFile;
			}
		}
		// console.error('reverseChangeMap=', this.reverseChangeMap);

		this.handle(session, result);
	}

	protected override async loadExtraState(state: IState & { options: {} }, session: IHeftTaskSession): Promise<void> {
		if (!state.logger) state.logger = createHeftLogger(session);
	}

	private async listGenFiles(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const options = {
			exclude: this.exclude,
			files: [],
			include: this.include,
		};
		return parseSingleTsConfigJson(session.logger, this.state.ts, configuration.rigConfig, options);
	}
}
