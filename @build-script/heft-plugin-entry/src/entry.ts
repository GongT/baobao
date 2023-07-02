import { dirname, resolve } from 'path';
import { isModuleResolutionError } from './lib';

export interface IOptions {
	projectRoot: string;
	sourceEntry: string;
	distEntry: string;
}

export function loadPlugin({ projectRoot, sourceEntry, distEntry }: IOptions) {
	const pkg = require(resolve(projectRoot, 'package.json'));

	try {
		require('@gongt/fix-esm').register();

		Error.stackTraceLimit = Infinity;
		try {
			const dist = resolve(projectRoot, distEntry);
			const ex = require(dist);
			const plugin = ex.default || ex;
			console.log('[heft-plugin-entry] load plugin %s success. (%s)', plugin.pluginName, dist);
			return plugin;
		} catch (e: any) {
			if (!isModuleResolutionError(e)) {
				throw e;
			}
		}

		const stream = process.stdout;
		if (stream.isTTY) {
			stream.write('\x1B[38;5;11m');
		}
		stream.write(`[heft-plugin-entry] try load heft plugin "${pkg.name}" from source (using ts-node loader)`);
		if (stream.isTTY) {
			stream.write('\x1B[0m');
		}
		stream.write('\n');

		const entry = resolve(projectRoot, sourceEntry);
		const cwd = dirname(entry);

		const tsnode: typeof import('ts-node') = require('ts-node');
		tsnode.register({ cwd });

		const ex = require(entry);
		const plugin = ex.default || ex;
		console.log('[heft-plugin-entry] load plugin %s success. (%s)', plugin.pluginName, entry);

		if (!plugin.apply || !plugin.pluginName) {
			console.error('[!!!] invalid export from %s', entry);
		}

		return plugin;
	} catch (e: any) {
		if (process.env['PRINT_ERROR_STACK']) {
			console.error('When loading heft plugin "%s", An error occur: %s', pkg.name, e.stack);
		} else {
			console.error(
				'When loading heft plugin "%s", something goes wrong. (set $env:PRINT_ERROR_STACK to see stacktrace)',
				pkg.name
			);
		}
		throw e;
	}
}
