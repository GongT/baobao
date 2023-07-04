import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';
import { getTypeScript } from '../../misc/getTypeScript';
import { ILoadConfigOverride, loadTsConfigJson } from '../../misc/loadTsConfigJson';
import { createHeftLogger } from '../../misc/scopedLogger';
import { createIndex } from './inc/create';

export const PLUGIN_NAME = 'create-index';

export default class CreateIndexPlugin implements IHeftTaskPlugin<ILoadConfigOverride> {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options: ILoadConfigOverride): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const command = await loadTsConfigJson(
				session.logger,
				await getTypeScript(session, configuration),
				configuration.rigConfig,
				options
			);

			const toolPath = await configuration.rigPackageResolver.resolvePackageAsync(
				'typescript',
				session.logger.terminal
			);
			const ts = await import(toolPath);
			createIndex(ts, command, createHeftLogger(session));

			session.logger.terminal.writeDebugLine('index created.');
		});
	}
}
