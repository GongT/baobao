import { getTypeScript } from '../../misc/getTypeScript';
import { loadTsConfigJson } from '../../misc/loadTsConfigJson';
import { createHeftLogger } from '../../misc/scopedLogger';
import { run } from './share';

import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';

const PLUGIN_NAME = 'codegen';

export default class CodeGenPlugin implements IHeftTaskPlugin {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, _pluginOptions?: void): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const options = {
				exclude: [],
				files: [],
				include: ['**/*.generator.ts', '**/*.generator.js'],
			};
			const command = await loadTsConfigJson(
				session.logger,
				await getTypeScript(session, configuration),
				configuration.rigConfig,
				options
			);

			run(command.fileNames, createHeftLogger(session));

			session.logger.terminal.writeLine('code generate complete.');
		});
	}
}
