import { createTaskPlugin, TsPluginInstance } from '@build-script/heft-plugin-base';
import type { IHeftTaskRunIncrementalHookOptions } from '@rushstack/heft';
import { resolve } from 'node:path';
import json from './config-file-schema.json';
import { createIndex } from './inc/create.js';

export class AutoIndexPlugin extends TsPluginInstance<{}> {
	private readonly config = this.loadConfig<any>('autoindex', json);

	override async run() {
		const { command } = this.loadTsConfig();

		const filename = this.config.filename || 'src/__create_index.generated.ts';

		createIndex(this.ts, command, this.logger, resolve(this.configuration.buildFolderPath, filename));

		this.session.logger.terminal.writeLine('index created.');
	}

	override async watch(watchOptions: IHeftTaskRunIncrementalHookOptions): Promise<void> {
		const { command, files } = await this.loadTsConfigWatch(watchOptions);

		if (files.length === 0) {
			this.session.logger.terminal.writeLine('not change, index skip.');
			return;
		}

		const filename = this.config.filename || 'src/__create_index.generated.ts';

		createIndex(this.ts, command, this.logger, resolve(this.configuration.buildFolderPath, filename));
		this.session.logger.terminal.writeLine('index created.');
	}
}

export default createTaskPlugin('autoindex', AutoIndexPlugin);
