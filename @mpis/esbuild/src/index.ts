import { argv } from '@idlebox/args/default';
import { convertCaughtError, definePrivateConstant, isModuleResolutionError } from '@idlebox/common';
import { channelClient } from '@mpis/client';
import type esbuild from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { inspect, type InspectContext } from 'node:util';

type Opt = esbuild.BuildOptions & ({ watch?: esbuild.WatchOptions } | { serve?: esbuild.ServeOptions });

type OptionOrFunc = Opt | (() => Opt | Promise<Opt>);
export type { esbuild };

function loadLocalEsbuild(): typeof esbuild | null {
	try {
		const require = createRequire(resolve(process.cwd(), 'index.js'));
		return require('esbuild');
	} catch (error) {
		if (isModuleResolutionError(error)) {
			console.log('esbuild not found in project, using private.');
			return null;
		}
		throw error;
	}
}

export async function defineEsbuild(title: string, options: OptionOrFunc): Promise<esbuild.BuildContext> {
	const watchMode = argv.flag(['-w', '--watch']);

	channelClient.friendlyTitle = title;

	if (typeof options === 'function') {
		options = await options();
	}

	options = {
		logLevel: 'silent',
		format: 'esm',
		sourcemap: 'linked',
		...options,
	};

	if (!options.plugins) options.plugins = [];

	options.plugins.push({
		name: 'build-protocol',
		setup(build) {
			build.onStart(() => {
				console.log('[watch] build started');
				channelClient.start();
			});

			build.onEnd((result) => {
				const errors: string[] = [];
				for (const error of result.errors) {
					errors.push(`> ${error.location?.file}:${error.location?.line}:${error.location?.column}: error: ${error.text}`);
				}
				for (const error of result.warnings) {
					errors.push(`> ${error.location?.file}:${error.location?.line}:${error.location?.column}: warning: ${error.text}`);
				}

				console.log('[watch] build finished');
				if (errors.length) {
					channelClient.failed('esbuild build failed', errors.join('\n'));
					console.error(errors.join('\n'));
				} else {
					channelClient.success('esbuild build finished');
				}
			});
		},
	});

	const ctx = await initialize(options);

	try {
		if (watchMode) {
			console.log('Entering watch mode...');
			if ('serve' in options) {
				await ctx.serve(options.serve);
			} else {
				await ctx.watch((options as any).watch);
			}
			process.on('beforeExit', async () => {
				console.log('Exiting...');
				await ctx.dispose();
				process.exit(0);
			});
		} else {
			console.log('Building...');
			await ctx.rebuild();
			await ctx.dispose();
		}
	} catch (error) {
		const err = convertCaughtError(error);
		channelClient.failed('esbuild build failed', err.stack || 'no stack');
		throw err;
	}
	return ctx;
}

async function initialize(options: esbuild.BuildOptions) {
	try {
		const esb: typeof esbuild = loadLocalEsbuild() || (await import('esbuild').then((m) => m.default || m));
		return await esb.context(options);
	} catch (error) {
		const err = convertCaughtError(error);

		let information = `Failed to initialize esbuild.`;

		for (const item of options.plugins ?? []) {
			definePrivateConstant(item, inspect.custom, (_: any, context: InspectContext) => {
				return context.stylize(`[Plugin: ${item.name}]`, 'special');
			});
		}

		information += `\nOptions: ${inspect(options, { depth: 8, colors: true })}`;

		information += `\n${err.stack || 'no stack'}`;

		channelClient.failed('esbuild initialize failed', information);
		throw err;
	}
}
