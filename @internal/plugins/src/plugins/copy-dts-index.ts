import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IHeftTaskPlugin } from '@rushstack/heft';
import { writeFileIfChange } from '../inc/fs';

export const PLUGIN_NAME = 'copy-dts-index';

interface IOptions {
	readonly sourceFile: string;
}

export default class CopyDtsIndexPlugin implements IHeftTaskPlugin<IOptions> {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options: IOptions): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const source = resolve(configuration.buildFolderPath, options.sourceFile);
			const sourceData = await readFile(source, 'utf-8');

			const pkg = require(resolve(configuration.buildFolderPath, 'package.json'));
			const cjsIndex = resolve(configuration.buildFolderPath, pkg.main);
			const esmIndex = resolve(configuration.buildFolderPath, pkg.module);

			const ch1 = await writeFileIfChange(cjsIndex.replace(/\.cjs$/, '.d.cts'), sourceData);
			if (ch1) session.logger.terminal.writeLine('.d.cts created!');

			const ch2 = await writeFileIfChange(esmIndex.replace(/\.mjs$/, '.d.mts'), sourceData);
			if (ch2) session.logger.terminal.writeLine('.d.mts created!');
		});
	}
}
