import type { HeftConfiguration, IHeftTaskRunIncrementalHookOptions, IHeftTaskSession } from '@rushstack/heft';

import { parseTsConfigJson } from '../../misc/loadTsConfigJson';
import { HeftTypescriptPlugin, ITypeScriptState } from '../../misc/pluginBase';
import { createHeftLogger, IOutputShim } from '../../misc/scopedLogger';
import { run } from './share';

interface IState extends ITypeScriptState {
	logger: IOutputShim;
}

export default class CodeGenPlugin extends HeftTypescriptPlugin<IState, {}> {
	override PLUGIN_NAME = 'codegen';

	override async run(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const command = await this.listGenFiles(session, configuration);

		if (command.fileNames.length === 0) {
			session.logger.terminal.writeLine('no generator found.');
			return;
		}

		run(command.fileNames, this.state.logger);

		session.logger.terminal.writeLine('code generate complete.');
	}

	override async runWatch(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		watchOptions: IHeftTaskRunIncrementalHookOptions
	): Promise<void> {
		const command = await this.listGenFiles(session, configuration);

		const map = await watchOptions.watchGlobAsync(command.fileNames, { cwd: configuration.buildFolderPath });

		const files = [];
		for (const [file, { changed }] of map.entries()) {
			if (!changed) continue;

			files.push(file);
		}

		if (files.length === 0) {
			session.logger.terminal.writeLine('no generator found or changed.');
			return;
		}

		run(files, this.state.logger);

		session.logger.terminal.writeLine('code generate complete.');
	}

	protected override async loadExtraState(state: IState & { options: {} }, session: IHeftTaskSession): Promise<void> {
		if (!state.logger) state.logger = createHeftLogger(session);
	}

	private async listGenFiles(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const options = {
			exclude: [],
			files: [],
			include: ['**/*.generator.ts', '**/*.generator.js'],
		};
		return parseTsConfigJson(session.logger, this.state.ts, configuration.rigConfig, options);
	}
}
