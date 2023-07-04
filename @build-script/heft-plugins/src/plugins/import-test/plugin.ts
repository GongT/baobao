import { resolve } from 'path';
import { createHeftLogger } from '../../misc/scopedLogger';
import { run } from './share';

import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';

const PLUGIN_NAME = 'import-test';

export default class ImportTestPlugin implements IHeftTaskPlugin {
	apply(session: IHeftTaskSession, heftConfiguration: HeftConfiguration, _pluginOptions?: void): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const ret = run(heftConfiguration.buildFolderPath, createHeftLogger(session), session.tempFolderPath);
			if (ret) {
				const err = new Error(ret.trim());
				err.stack = err.message;
				session.logger.emitError(err);
				session.logger.terminal.writeWarningLine(
					'package file: ' + resolve(heftConfiguration.buildFolderPath, 'package.json')
				);
			} else {
				session.logger.terminal.writeLine('import test passed.');
			}
		});
	}
}
