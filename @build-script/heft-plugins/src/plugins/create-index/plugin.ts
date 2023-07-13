import type { HeftConfiguration, IHeftTaskRunIncrementalHookOptions, IHeftTaskSession } from '@rushstack/heft';
import { ILoadConfigOverride } from '../../misc/loadTsConfigJson';
import { HeftTypescriptPlugin, ITypeScriptState } from '../../misc/pluginBase';
import { createHeftLogger } from '../../misc/scopedLogger';
import { createIndex } from './inc/create';

export const PLUGIN_NAME = 'create-index';

export default class CreateIndexPlugin extends HeftTypescriptPlugin<ITypeScriptState, ILoadConfigOverride> {
	override PLUGIN_NAME: string = PLUGIN_NAME;

	override async run(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const { command } = this.loadConfig(session, configuration);
		createIndex(this.state.ts, command, createHeftLogger(session));

		session.logger.terminal.writeLine('index created.');
	}

	override async runWatch(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		watchOptions: IHeftTaskRunIncrementalHookOptions
	): Promise<void> {
		const { command, files } = await this.loadConfigWatch(session, configuration, watchOptions);

		if (files.length === 0) {
			session.logger.terminal.writeLine('not change, index skip.');
			return;
		}

		createIndex(this.state.ts, command, createHeftLogger(session));
		session.logger.terminal.writeLine('index created.');
	}
}
