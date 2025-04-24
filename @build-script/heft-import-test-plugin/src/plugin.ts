import { getRushTempFolder, wrapHeftLogger } from '@build-script/heft-plugin-base';
import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';
import { resolve } from 'node:path';
import { run } from './share.js';

const PLUGIN_NAME = 'import-test';

export default class ImportTestPlugin implements IHeftTaskPlugin {
	apply(session: IHeftTaskSession, heftConfiguration: HeftConfiguration, _pluginOptions?: undefined): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const temp = getRushTempFolder(heftConfiguration.buildFolderPath);

			const ret = await run(heftConfiguration.buildFolderPath, wrapHeftLogger(session), temp);
			if (ret) {
				const err = new Error(ret.trim());
				err.stack = err.message;
				session.logger.emitError(err);
				session.logger.terminal.writeWarningLine(
					`package file: ${resolve(heftConfiguration.buildFolderPath, 'package.json')}`
				);
			} else {
				session.logger.terminal.writeLine('import test passed.');
			}
		});
	}
}
